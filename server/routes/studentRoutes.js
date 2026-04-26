const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validate, schemas } = require('../middleware/validate');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/students
 * @desc    Get all students (with optional filters)
 * @access  Teacher only
 */
router.get('/', authorize('TEACHER'), studentController.getAllStudents);

/**
 * @route   GET /api/students/:id
 * @desc    Get student by ID
 * @access  Teacher only
 */
router.get(
  '/:id',
  authorize('TEACHER'),
  validate(schemas.studentIdParam, 'params'),
  studentController.getStudentById
);

/**
 * @route   GET /api/students/:id/attendance
 * @desc    Get student's attendance history
 * @access  Teacher only
 */
router.get(
  '/:id/attendance',
  authorize('TEACHER'),
  validate(schemas.studentIdParam, 'params'),
  studentController.getStudentAttendance
);

/**
 * @route   GET /api/students/:id/stats
 * @desc    Get student's attendance stats
 * @access  Teacher only
 */
router.get(
  '/:id/stats',
  authorize('TEACHER'),
  validate(schemas.studentIdParam, 'params'),
  studentController.getStudentStats
);

/**
 * @route   POST /api/students/:id/subjects
 * @desc    Add student to subject
 * @access  Teacher only
 */
router.post(
  '/:id/subjects',
  authorize('TEACHER'),
  validate(schemas.studentIdParam, 'params'),
  validate(schemas.addStudentToSubject),
  studentController.addStudentToSubject
);

module.exports = router;
