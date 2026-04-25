const Student = require('../models/Student');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceStats = require('../models/AttendanceStats');
const Subject = require('../models/Subject');

/**
 * Get all students
 * GET /api/students
 * Teacher only
 */
async function getAllStudents(req, res, next) {
  try {
    const { subjectId, branch, semester, page = 1, limit = 20 } = req.query;

    const query = {};

    if (branch) query.branch = branch.toUpperCase();
    if (semester) query.semester = parseInt(semester, 10);
    if (subjectId) {
      query.subjects = subjectId;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('subjects', 'name code')
        .skip(skip)
        .limit(parseInt(limit, 10))
        .sort({ rollNumber: 1 }),
      Student.countDocuments(query),
    ]);

    res.json({
      students,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get student by ID
 * GET /api/students/:id
 * Teacher only
 */
async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;

    const student = await Student.findById(id).populate('subjects', 'name code');

    if (!student) {
      return res.status(404).json({ error: 'STUDENT_NOT_FOUND' });
    }

    res.json({ student });
  } catch (err) {
    next(err);
  }
}

/**
 * Get student's attendance history
 * GET /api/students/:id/attendance
 * Teacher only
 */
async function getStudentAttendance(req, res, next) {
  try {
    const { id } = req.params;
    const { subjectId, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = { studentId: id };

    if (subjectId) query.subjectId = subjectId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [records, total] = await Promise.all([
      AttendanceRecord.find(query)
        .populate('subjectId', 'name code')
        .populate('sessionId', 'startedAt stoppedAt')
        .skip(skip)
        .limit(parseInt(limit, 10))
        .sort({ createdAt: -1 }),
      AttendanceRecord.countDocuments(query),
    ]);

    res.json({
      records,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get student's attendance stats
 * GET /api/students/:id/stats
 * Teacher only
 */
async function getStudentStats(req, res, next) {
  try {
    const { id } = req.params;
    const { subjectId } = req.query;

    const query = { studentId: id };
    if (subjectId) query.subjectId = subjectId;

    const stats = await AttendanceStats.find(query).populate('subjectId', 'name code');
    const student = await Student.findById(id);

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

    res.json({
      student: {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        branch: student.branch,
        semester: student.semester,
      },
      bySubject: stats,
      overall,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Add student to subject
 * POST /api/students/:id/subjects
 * Teacher only
 */
async function addStudentToSubject(req, res, next) {
  try {
    const { id } = req.params;
    const { subjectId } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'STUDENT_NOT_FOUND' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'SUBJECT_NOT_FOUND' });
    }

    if (!student.subjects.includes(subjectId)) {
      student.subjects.push(subjectId);
      await student.save();
    }

    res.json({
      message: 'Student added to subject',
      student,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  getStudentAttendance,
  getStudentStats,
  addStudentToSubject,
};
