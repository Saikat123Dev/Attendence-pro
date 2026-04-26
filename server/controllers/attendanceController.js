const attendanceService = require('../services/attendanceService');
const {
  getTeacherIdentityByUserId,
  getStudentIdentityByUserId,
} = require('../utils/profileResolver');

/**
 * Start attendance session
 * POST /api/attendance/start
 * Teacher only
 */
async function startSession(req, res, next) {
  try {
    const { subjectId } = req.body;
    const { teacherId, ownerIds } = await getTeacherIdentityByUserId(req.user.sub);

    const result = await attendanceService.startSession(teacherId, subjectId, ownerIds);

    res.status(201).json({
      message: 'Session started',
      session: {
        _id: result.session._id,
        status: result.session.status,
        subjectId: result.session.subjectId,
        startedAt: result.session.startedAt,
      },
      initialToken: result.initialToken,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Stop attendance session
 * POST /api/attendance/stop
 * Teacher only
 */
async function stopSession(req, res, next) {
  try {
    const { sessionId } = req.body;
    const { teacherId, ownerIds } = await getTeacherIdentityByUserId(req.user.sub);

    const session = await attendanceService.stopSession(sessionId, teacherId, ownerIds);

    res.json({
      message: 'Session stopped',
      session: {
        _id: session._id,
        status: session.status,
        startedAt: session.startedAt,
        stoppedAt: session.stoppedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current session with QR token
 * GET /api/attendance/session/:id/qr
 * Teacher only
 */
async function getSessionQR(req, res, next) {
  try {
    const { id } = req.params;
    const { ownerIds } = await getTeacherIdentityByUserId(req.user.sub);
    const result = await attendanceService.getSessionQRToken(id, ownerIds);

    res.json({
      qrData: result.qrData,
      expiresAt: result.expiresAt,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get session details
 * GET /api/attendance/session/:id
 * Teacher only
 */
async function getSession(req, res, next) {
  try {
    const { id } = req.params;
    const { ownerIds } = await getTeacherIdentityByUserId(req.user.sub);
    const result = await attendanceService.getCurrentSession(id, ownerIds);

    res.json({
      session: result.session,
      currentToken: result.currentToken,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Mark attendance (student)
 * POST /api/attendance/mark
 * Student only
 */
async function markAttendance(req, res, next) {
  try {
    const { sessionId, qrData, deviceInfo } = req.body;
    const { studentId } = await getStudentIdentityByUserId(req.user.sub);

    const record = await attendanceService.markAttendance(
      sessionId,
      qrData,
      studentId,
      deviceInfo
    );

    res.status(201).json({
      message: 'Attendance marked successfully',
      record: {
        _id: record._id,
        status: record.status,
        markedAt: record.markedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get my attendance (student)
 * GET /api/attendance/my
 * Student only
 */
async function getMyAttendance(req, res, next) {
  try {
    const { studentId } = await getStudentIdentityByUserId(req.user.sub);
    const { subjectId, startDate, endDate } = req.query;

    const records = await attendanceService.getStudentAttendance(studentId, {
      subjectId,
      startDate,
      endDate,
    });

    res.json({ records });
  } catch (err) {
    next(err);
  }
}

/**
 * Get my stats (student)
 * GET /api/attendance/stats
 * Student only
 */
async function getMyStats(req, res, next) {
  try {
    const { studentId } = await getStudentIdentityByUserId(req.user.sub);
    const { subjectId } = req.query;

    const stats = await attendanceService.getStudentStats(studentId, subjectId);

    res.json(stats);
  } catch (err) {
    next(err);
  }
}

/**
 * Get active sessions for a subject
 * GET /api/attendance/active
 * Teacher only
 */
async function getActiveSessions(req, res, next) {
  try {
    const { ownerIds } = await getTeacherIdentityByUserId(req.user.sub);
    const AttendanceSession = require('../models/AttendanceSession');

    const sessions = await AttendanceSession.find({
      teacherId: { $in: ownerIds },
      status: 'ACTIVE',
    }).populate('subjectId', 'name code');

    res.json({ sessions });
  } catch (err) {
    next(err);
  }
}

/**
 * Get session history
 * GET /api/attendance/history
 * Teacher only
 */
async function getSessionHistory(req, res, next) {
  try {
    const { ownerIds } = await getTeacherIdentityByUserId(req.user.sub);
    const { subjectId, status, startDate, endDate, page, limit } = req.query;

    const result = await attendanceService.getSessionHistory(ownerIds, {
      subjectId,
      status,
      startDate,
      endDate,
      page,
      limit,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Get session details with all attendance records
 * GET /api/attendance/session/:id/details
 * Teacher only
 */
async function getSessionDetails(req, res, next) {
  try {
    const { id } = req.params;
    const { ownerIds } = await getTeacherIdentityByUserId(req.user.sub);

    const result = await attendanceService.getSessionDetails(id, ownerIds);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  startSession,
  stopSession,
  getSessionQR,
  getSession,
  markAttendance,
  getMyAttendance,
  getMyStats,
  getActiveSessions,
  getSessionHistory,
  getSessionDetails,
};
