const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validate, schemas } = require('../middleware/validate');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/subjects
 * @desc    Get all subjects for current teacher
 * @access  Teacher only
 */
router.get('/', authorize('TEACHER'), subjectController.getMySubjects);

/**
 * @route   GET /api/subjects/available
 * @desc    Get all available subjects (for students to see)
 * @access  Authenticated
 */
router.get('/available', subjectController.getAvailableSubjects);

// New endpoint for students to get their enrolled subjects
/**
 * @route   GET /api/subjects/student
 * @desc    Get student's enrolled subjects
 * @access  Student
 */
router.get('/student', authorize('STUDENT'), subjectController.getStudentSubjects);

/**
 * @route   POST /api/subjects/:id/self-enroll
 * @desc    Enroll current student in a compatible subject
 * @access  Student
 */
router.post(
  '/:id/self-enroll',
  authorize('STUDENT'),
  validate(schemas.subjectIdParam, 'params'),
  subjectController.selfEnrollSubject
);

/**
 * @route   POST /api/subjects/:id/self-unenroll
 * @desc    Remove current student from an enrolled subject
 * @access  Student
 */
router.post(
  '/:id/self-unenroll',
  authorize('STUDENT'),
  validate(schemas.subjectIdParam, 'params'),
  subjectController.selfUnenrollSubject
);

/**
 * @route   GET /api/subjects/:id
 * @desc    Get subject by ID
 * @access  Teacher (own) or Student (enrolled)
 */
router.get('/:id', validate(schemas.subjectIdParam, 'params'), subjectController.getSubjectById);

/**
 * @route   POST /api/subjects
 * @desc    Create new subject
 * @access  Teacher only
 */
router.post(
  '/',
  authorize('TEACHER'),
  validate(schemas.createSubject),
  subjectController.createSubject
);

/**
 * @route   PUT /api/subjects/:id
 * @desc    Update subject
 * @access  Teacher only (owner)
 */
router.put(
  '/:id',
  authorize('TEACHER'),
  validate(schemas.subjectIdParam, 'params'),
  validate(schemas.updateSubject),
  subjectController.updateSubject
);

/**
 * @route   DELETE /api/subjects/:id
 * @desc    Delete subject
 * @access  Teacher only (owner)
 */
router.delete(
  '/:id',
  authorize('TEACHER'),
  validate(schemas.subjectIdParam, 'params'),
  subjectController.deleteSubject
);

/**
 * @route   POST /api/subjects/:id/enroll
 * @desc    Enroll students in subject
 * @access  Teacher only (owner)
 */
router.post(
  '/:id/enroll',
  authorize('TEACHER'),
  validate(schemas.subjectIdParam, 'params'),
  validate(schemas.subjectStudentBulk),
  subjectController.enrollStudents
);

/**
 * @route   POST /api/subjects/:id/unenroll
 * @desc    Remove students from subject
 * @access  Teacher only (owner)
 */
router.post(
  '/:id/unenroll',
  authorize('TEACHER'),
  validate(schemas.subjectIdParam, 'params'),
  validate(schemas.subjectStudentBulk),
  subjectController.unenrollStudents
);

/**
 * @route   GET /api/subjects/:id/available
 * @desc    Get students not enrolled in subject
 * @access  Teacher only (owner)
 */
router.get(
  '/:id/available',
  authorize('TEACHER'),
  validate(schemas.subjectIdParam, 'params'),
  subjectController.getAvailableStudents
);

module.exports = router;
