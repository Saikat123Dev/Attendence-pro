const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceStats = require('../models/AttendanceStats');
const Student = require('../models/Student');
const Subject = require('../models/Subject');

/**
 * Get overall analytics for teacher
 * GET /api/analytics/overview
 * Teacher only
 */
async function getOverview(req, res, next) {
  try {
    const teacherId = req.user.sub;

    // Get today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalSessions, todaySessions, totalStudents, recentRecords] = await Promise.all([
      AttendanceSession.countDocuments({ teacherId }),
      AttendanceSession.countDocuments({
        teacherId,
        startedAt: { $gte: today },
      }),
      Student.countDocuments(),
      AttendanceRecord.countDocuments({
        teacherId,
        createdAt: { $gte: today },
      }),
    ]);

    res.json({
      totalSessions,
      todaySessions,
      totalStudents,
      todayAttendanceMarked: recentRecords,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get analytics for a subject
 * GET /api/analytics/subject/:id
 * Teacher only
 */
async function getSubjectAnalytics(req, res, next) {
  try {
    const { id } = req.params;
    const teacherId = req.user.sub;

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ error: 'SUBJECT_NOT_FOUND' });
    }

    if (subject.teacherId.toString() !== teacherId) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    // Get all sessions for this subject
    const sessions = await AttendanceSession.find({ subjectId: id });

    const sessionIds = sessions.map((s) => s._id);

    // Get attendance stats
    const stats = await AttendanceStats.find({ subjectId: id }).populate(
      'studentId',
      'name rollNumber'
    );

    // Calculate subject-level stats
    const totalStudents = stats.length;
    const avgAttendance =
      stats.length > 0
        ? Math.round((stats.reduce((acc, s) => acc + s.attendancePercentage, 0) / stats.length) * 100) / 100
        : 0;

    const sessionStats = await AttendanceRecord.aggregate([
      { $match: { subjectId: subject._id } },
      {
        $group: {
          _id: null,
          totalPresent: { $sum: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] } },
          totalAbsent: { $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] } },
        },
      },
    ]);

    const { totalPresent = 0, totalAbsent = 0 } = sessionStats[0] || {};

    res.json({
      subject: {
        _id: subject._id,
        name: subject.name,
        code: subject.code,
      },
      totalSessions: sessions.length,
      totalStudents,
      averageAttendance: avgAttendance,
      totalPresent,
      totalAbsent,
      byStudent: stats.map((s) => ({
        studentId: s.studentId._id,
        name: s.studentId.name,
        rollNumber: s.studentId.rollNumber,
        percentage: s.attendancePercentage,
        totalSessions: s.totalSessions,
        present: s.presentCount,
        absent: s.absentCount,
      })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get low attendance alerts
 * GET /api/analytics/alerts
 * Teacher only
 */
async function getAlerts(req, res, next) {
  try {
    const teacherId = req.user.sub;
    const { threshold = 75 } = req.query;

    // Get teacher's subjects
    const subjects = await Subject.find({ teacherId });
    const subjectIds = subjects.map((s) => s._id);

    // Find students with low attendance
    const lowAttendance = await AttendanceStats.find({
      subjectId: { $in: subjectIds },
      attendancePercentage: { $lt: parseInt(threshold, 10) },
    })
      .populate('studentId', 'name rollNumber branch semester')
      .populate('subjectId', 'name code')
      .sort({ attendancePercentage: 1 });

    res.json({
      alerts: lowAttendance.map((s) => ({
        student: s.studentId,
        subject: s.subjectId,
        percentage: s.attendancePercentage,
        totalSessions: s.totalSessions,
        present: s.presentCount,
        absent: s.absentCount,
      })),
      threshold: parseInt(threshold, 10),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOverview,
  getSubjectAnalytics,
  getAlerts,
};
