const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceStats = require('../models/AttendanceStats');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const { generateQRToken, validateQRToken } = require('../utils/tokenGenerator');
const sseManager = require('./sseManager');
const { isOwnedBy } = require('../utils/profileResolver');

/**
 * Start a new attendance session
 * @param {string} teacherId - Teacher's ObjectId
 * @param {string} subjectId - Subject's ObjectId
 * @returns {Object} { session, initialToken }
 */
async function startSession(teacherId, subjectId, ownerIds = [teacherId.toString()]) {
  // Verify subject exists and belongs to teacher
  const subject = await Subject.findById(subjectId);

  if (!subject) {
    throw Object.assign(new Error('SUBJECT_NOT_FOUND'), { status: 404 });
  }

  if (!isOwnedBy(subject, ownerIds)) {
    throw Object.assign(new Error('NOT_AUTHORIZED'), { status: 403 });
  }

  // Check for existing active session for this subject
  const existingSession = await AttendanceSession.findOne({
    subjectId,
    status: 'ACTIVE',
  });

  if (existingSession) {
    throw Object.assign(new Error('SESSION_ALREADY_ACTIVE'), { status: 409 });
  }

  const enrolledStudentIds = await Student.find({ subjects: subjectId })
    .select('_id')
    .lean();

  // Create new session
  const session = await AttendanceSession.create({
    teacherId,
    subjectId,
    enrolledStudentIds: enrolledStudentIds.map((student) => student._id),
    status: 'ACTIVE',
    startedAt: new Date(),
  });

  // Generate initial QR token
  const token = generateQRToken(session._id.toString());

  // Store token in session
  session.currentToken = token.data;
  session.currentTokenExpiry = new Date(Date.now() + 2000);
  await session.save();

  return {
    session,
    initialToken: token.data,
  };
}

/**
 * Stop an active attendance session
 * @param {string} sessionId - Session ID to stop
 * @param {string} teacherId - Teacher's ObjectId (for authorization)
 */
async function stopSession(sessionId, teacherId, ownerIds = [teacherId.toString()]) {
  const session = await AttendanceSession.findById(sessionId);

  if (!session) {
    throw Object.assign(new Error('SESSION_NOT_FOUND'), { status: 404 });
  }

  if (!isOwnedBy(session, ownerIds)) {
    throw Object.assign(new Error('NOT_AUTHORIZED'), { status: 403 });
  }

  if (session.status === 'STOPPED') {
    throw Object.assign(new Error('SESSION_ALREADY_STOPPED'), { status: 409 });
  }

  session.status = 'STOPPED';
  session.stoppedAt = new Date();
  session.currentToken = null;
  session.currentTokenExpiry = null;
  await session.save();

  // Mark absent students who didn't mark attendance
  await markAbsentStudents(session);

  // Broadcast session ended to SSE clients
  sseManager.broadcastSessionEnded(sessionId.toString());

  return session;
}

/**
 * Get current session with valid QR token
 * @param {string} sessionId - Session ID
 * @returns {Object} { session, currentQRToken }
 */
async function getCurrentSession(sessionId, ownerIds = null) {
  const session = await AttendanceSession.findById(sessionId)
    .populate('subjectId');

  if (!session) {
    throw Object.assign(new Error('SESSION_NOT_FOUND'), { status: 404 });
  }

  if (ownerIds && !isOwnedBy(session, ownerIds)) {
    throw Object.assign(new Error('NOT_AUTHORIZED'), { status: 403 });
  }

  // Generate fresh token if session is active
  let currentToken = null;

  if (session.status === 'ACTIVE') {
    const token = generateQRToken(session._id.toString());
    currentToken = token.data;

    // Update session with new token
    session.currentToken = token.data;
    session.currentTokenExpiry = new Date(Date.now() + 2000);
    await session.save();
  }

  return { session, currentToken };
}

/**
 * Get QR token for active session (called by teacher to refresh QR display)
 * @param {string} sessionId - Session ID
 * @returns {Object} { qrData, expiresAt }
 */
async function getSessionQRToken(sessionId, ownerIds = null) {
  const session = await AttendanceSession.findById(sessionId);

  if (!session) {
    throw Object.assign(new Error('SESSION_NOT_FOUND'), { status: 404 });
  }

  if (ownerIds && !isOwnedBy(session, ownerIds)) {
    throw Object.assign(new Error('NOT_AUTHORIZED'), { status: 403 });
  }

  if (session.status !== 'ACTIVE') {
    throw Object.assign(new Error('SESSION_INACTIVE'), { status: 400 });
  }

  // Generate new token
  const token = generateQRToken(session._id.toString());

  session.currentToken = token.data;
  session.currentTokenExpiry = new Date(Date.now() + 2000);
  await session.save();

  return {
    qrData: token.data,
    expiresAt: session.currentTokenExpiry,
  };
}

/**
 * Mark attendance for a student
 * @param {string} sessionId - Attendance session ID
 * @param {string} qrData - QR code data from student scan
 * @param {string} studentId - Student's ObjectId
 * @param {string} deviceInfo - Optional device info for audit
 */
async function markAttendance(sessionId, qrData, studentId, deviceInfo) {
  // Validate QR token
  const validation = validateQRToken(qrData, sessionId);

  if (!validation.valid) {
    throw Object.assign(new Error(validation.error), { status: 400 });
  }

  // Get session and verify
  const session = await AttendanceSession.findById(sessionId);

  if (!session) {
    throw Object.assign(new Error('SESSION_NOT_FOUND'), { status: 404 });
  }

  if (session.status !== 'ACTIVE') {
    throw Object.assign(new Error('SESSION_INACTIVE'), { status: 400 });
  }

  // Verify student exists and is in this subject
  const student = await Student.findById(studentId);

  if (!student) {
    throw Object.assign(new Error('STUDENT_NOT_FOUND'), { status: 404 });
  }

  const sessionRoster = Array.isArray(session.enrolledStudentIds)
    ? session.enrolledStudentIds.map((id) => id.toString())
    : null;

  // Check if student is currently enrolled in the subject
  const isCurrentlyEnrolled = student.subjects.some(
    (subjectId) => subjectId.toString() === session.subjectId.toString()
  );

  // Check if student was part of the roster when the session started
  if (sessionRoster) {
    const wasInRoster = sessionRoster.includes(studentId.toString());
    // Allow if student was in roster OR is currently enrolled in the subject
    if (!wasInRoster && !isCurrentlyEnrolled) {
      throw Object.assign(new Error('STUDENT_NOT_IN_SESSION_ROSTER'), { status: 403 });
    }
  } else {
    if (!isCurrentlyEnrolled) {
      throw Object.assign(new Error('STUDENT_NOT_IN_SUBJECT'), { status: 403 });
    }
  }

  // Check for duplicate attendance (unique index will also catch this)
  const existingRecord = await AttendanceRecord.findOne({
    sessionId,
    studentId,
  });

  if (existingRecord) {
    throw Object.assign(new Error('ALREADY_MARKED'), { status: 409 });
  }

  // Create attendance record
  const record = await AttendanceRecord.create({
    sessionId,
    studentId,
    subjectId: session.subjectId,
    teacherId: session.teacherId,
    status: 'PRESENT',
    markedAt: new Date(),
    deviceInfo,
  });

  // Update stats
  await updateStats(studentId, session.subjectId);

  // Broadcast to SSE clients watching this session
  const studentData = await Student.findById(studentId).select('name rollNumber');
  sseManager.broadcast(sessionId.toString(), {
    recordId: record._id,
    studentId,
    studentName: studentData.name,
    rollNumber: studentData.rollNumber,
    markedAt: record.markedAt,
  });

  return record;
}

/**
 * Update attendance statistics for a student-subject pair
 * @param {string} studentId - Student ID
 * @param {string} subjectId - Subject ID
 */
async function updateStats(studentId, subjectId) {
  // Count totals
  const totalSessions = await AttendanceRecord.countDocuments({
    studentId,
    subjectId,
  });

  const presentCount = await AttendanceRecord.countDocuments({
    studentId,
    subjectId,
    status: 'PRESENT',
  });

  const absentCount = totalSessions - presentCount;
  const attendancePercentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

  // Upsert stats
  await AttendanceStats.findOneAndUpdate(
    { studentId, subjectId },
    {
      $set: {
        totalSessions,
        presentCount,
        absentCount,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100,
        lastUpdated: new Date(),
      },
    },
    { upsert: true }
  );
}

/**
 * Mark absent students after session ends
 * @param {Object} session - Attendance session document
 */
async function markAbsentStudents(session) {
  const rosterStudentIds = Array.isArray(session.enrolledStudentIds)
    ? session.enrolledStudentIds.map((id) => id.toString())
    : (await Student.find({ subjects: session.subjectId }).select('_id').lean()).map((student) => student._id.toString());

  // Get all students in the frozen session roster
  const students = rosterStudentIds.length
    ? await Student.find({ _id: { $in: rosterStudentIds } }).select('_id')
    : [];

  // Get already marked students
  const markedRecords = await AttendanceRecord.find({ sessionId: session._id });
  const markedStudentIds = markedRecords.map((r) => r.studentId.toString());

  // Find students who didn't mark
  const absentStudents = students.filter(
    (s) => !markedStudentIds.includes(s._id.toString())
  );

  // Create absent records
  const absentRecords = absentStudents.map((student) => ({
    sessionId: session._id,
    studentId: student._id,
    subjectId: session.subjectId,
    teacherId: session.teacherId,
    status: 'ABSENT',
    markedAt: session.stoppedAt,
  }));

  if (absentRecords.length > 0) {
    await AttendanceRecord.insertMany(absentRecords);

    // Update stats for absent students
    for (const student of absentStudents) {
      await updateStats(student._id, session.subjectId);
    }
  }
}

/**
 * Get attendance records for a student
 * @param {string} studentId - Student ID
 * @param {Object} filters - Optional filters (subjectId, startDate, endDate)
 */
async function getStudentAttendance(studentId, filters = {}) {
  const query = { studentId };

  if (filters.subjectId) {
    query.subjectId = filters.subjectId;
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }

  const records = await AttendanceRecord.find(query)
    .populate('subjectId', 'name code')
    .sort({ createdAt: -1 });

  return records;
}

/**
 * Get attendance stats for a student
 * @param {string} studentId - Student ID
 * @param {string} subjectId - Optional subject ID filter
 */
async function getStudentStats(studentId, subjectId) {
  const query = { studentId };
  if (subjectId) query.subjectId = subjectId;

  const stats = await AttendanceStats.find(query).populate('subjectId', 'name code');

  // Calculate overall
  const overall = stats.reduce(
    (acc, s) => {
      acc.totalSessions += s.totalSessions;
      acc.presentCount += s.presentCount;
      acc.absentCount += s.absentCount;
      return acc;
    },
    { totalSessions: 0, presentCount: 0, absentCount: 0 }
  );

  overall.attendancePercentage =
    overall.totalSessions > 0
      ? Math.round((overall.presentCount / overall.totalSessions) * 10000) / 100
      : 0;

  return {
    bySubject: stats,
    overall,
  };
}

/**
 * Get session history for teacher
 * @param {string} teacherId - Teacher's ObjectId
 * @param {Object} filters - Optional filters (subjectId, startDate, endDate, page, limit)
 */
async function getSessionHistory(teacherIds, filters = {}) {
  const query = { teacherId: { $in: teacherIds } };

  if (filters.subjectId) {
    query.subjectId = filters.subjectId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    query.startedAt = {};
    if (filters.startDate) query.startedAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.startedAt.$lte = new Date(filters.endDate);
  }

  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    AttendanceSession.find(query)
      .populate('subjectId', 'name code')
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit),
    AttendanceSession.countDocuments(query),
  ]);

  // Get attendance counts for each session
  const sessionIds = sessions.map((s) => s._id);
  const recordCounts = await AttendanceRecord.aggregate([
    { $match: { sessionId: { $in: sessionIds } } },
    {
      $group: {
        _id: '$sessionId',
        total: { $sum: 1 },
        present: {
          $sum: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] },
        },
        absent: {
          $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] },
        },
      },
    },
  ]);

  const countMap = {};
  recordCounts.forEach((r) => {
    countMap[r._id.toString()] = r;
  });

  const sessionsWithStats = sessions.map((session) => ({
    _id: session._id,
    subjectId: session.subjectId,
    status: session.status,
    startedAt: session.startedAt,
    stoppedAt: session.stoppedAt,
    attendanceCount: countMap[session._id.toString()] || { total: 0, present: 0, absent: 0 },
  }));

  return {
    sessions: sessionsWithStats,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get detailed attendance for a specific session
 * @param {string} sessionId - Session ID
 * @param {string} teacherId - Teacher's ObjectId for authorization
 */
async function getSessionDetails(sessionId, ownerIds) {
  const session = await AttendanceSession.findById(sessionId).populate('subjectId', 'name code branch semester');

  if (!session) {
    throw Object.assign(new Error('SESSION_NOT_FOUND'), { status: 404 });
  }

  if (!isOwnedBy(session, ownerIds)) {
    throw Object.assign(new Error('NOT_AUTHORIZED'), { status: 403 });
  }

  const records = await AttendanceRecord.find({ sessionId })
    .populate('studentId', 'name rollNumber branch semester');

  records.sort((left, right) => {
    const leftRoll = left.studentId?.rollNumber || '';
    const rightRoll = right.studentId?.rollNumber || '';
    return String(leftRoll).localeCompare(String(rightRoll), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });

  const present = records.filter((r) => r.status === 'PRESENT');
  const absent = records.filter((r) => r.status === 'ABSENT');

  return {
    session: {
      _id: session._id,
      subjectId: session.subjectId,
      status: session.status,
      startedAt: session.startedAt,
      stoppedAt: session.stoppedAt,
    },
    summary: {
      total: records.length,
      present: present.length,
      absent: absent.length,
    },
    presentStudents: present.map((r) => ({
      _id: r._id,
      student: r.studentId,
      markedAt: r.markedAt,
    })),
    absentStudents: absent.map((r) => ({
      _id: r._id,
      student: r.studentId,
    })),
  };
}

module.exports = {
  startSession,
  stopSession,
  getCurrentSession,
  getSessionQRToken,
  markAttendance,
  getStudentAttendance,
  getStudentStats,
  getSessionHistory,
  getSessionDetails,
};
