const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/analytics/overview
 * @desc    Get overall analytics for teacher
 * @access  Teacher only
 */
router.get('/overview', authorize('TEACHER'), analyticsController.getOverview);

/**
 * @route   GET /api/analytics/subject/:id
 * @desc    Get analytics for a specific subject
 * @access  Teacher only
 */
router.get('/subject/:id', authorize('TEACHER'), analyticsController.getSubjectAnalytics);

/**
 * @route   GET /api/analytics/alerts
 * @desc    Get low attendance alerts
 * @access  Teacher only
 */
router.get('/alerts', authorize('TEACHER'), analyticsController.getAlerts);

module.exports = router;
