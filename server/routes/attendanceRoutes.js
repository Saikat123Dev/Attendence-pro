const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { validate, schemas } = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All routes require authentication
router.use(authenticate);

// ============ TEACHER ROUTES ============

/**
 * @route   POST /api/attendance/start
 * @desc    Start a new attendance session
 * @access  Teacher only
 */
router.post(
  '/start',
  authorize('TEACHER'),
  validate(schemas.startSession),
  attendanceController.startSession
);

/**
 * @route   POST /api/attendance/stop
 * @desc    Stop an active attendance session
 * @access  Teacher only
 */
router.post(
  '/stop',
  authorize('TEACHER'),
  validate(schemas.stopSession),
  attendanceController.stopSession
);

/**
 * @route   GET /api/attendance/session/:id/qr
 * @desc    Get current QR token for session display
 * @access  Teacher only
 */
router.get('/session/:id/qr', authorize('TEACHER'), attendanceController.getSessionQR);

/**
 * @route   GET /api/attendance/session/:id
 * @desc    Get session details
 * @access  Teacher only
 */
router.get('/session/:id', authorize('TEACHER'), attendanceController.getSession);

/**
 * @route   GET /api/attendance/active
 * @desc    Get all active sessions for teacher
 * @access  Teacher only
 */
router.get('/active', authorize('TEACHER'), attendanceController.getActiveSessions);

/**
 * @route   GET /api/attendance/history
 * @desc    Get session history for teacher
 * @access  Teacher only
 */
router.get('/history', authorize('TEACHER'), attendanceController.getSessionHistory);

/**
 * @route   GET /api/attendance/session/:id/details
 * @desc    Get detailed attendance for a session
 * @access  Teacher only
 */
router.get('/session/:id/details', authorize('TEACHER'), attendanceController.getSessionDetails);

// ============ STUDENT ROUTES ============

/**
 * @route   POST /api/attendance/mark
 * @desc    Mark attendance using QR code
 * @access  Student only
 */
router.post(
  '/mark',
  authorize('STUDENT'),
  validate(schemas.markAttendance),
  attendanceController.markAttendance
);

/**
 * @route   GET /api/attendance/my
 * @desc    Get my attendance records
 * @access  Student only
 */
router.get('/my', authorize('STUDENT'), attendanceController.getMyAttendance);

/**
 * @route   GET /api/attendance/stats
 * @desc    Get my attendance statistics
 * @access  Student only
 */
router.get('/stats', authorize('STUDENT'), attendanceController.getMyStats);

module.exports = router;
