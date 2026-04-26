const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validate, schemas } = require('../middleware/validate');
const sseManager = require('../services/sseManager');
const AttendanceSession = require('../models/AttendanceSession');
const { getTeacherIdentityByUserId, isOwnedBy } = require('../utils/profileResolver');

/**
 * @route   GET /api/attendance/session/:id/stream
 * @desc    SSE stream for real-time attendance updates
 * @access  Teacher only
 */
router.get(
  '/session/:id/stream',
  authenticate,
  authorize('TEACHER'),
  validate(schemas.sessionIdParam, 'params'),
  async (req, res, next) => {
    try {
      const { ownerIds } = await getTeacherIdentityByUserId(req.user.sub);
      const { id: sessionId } = req.params;
      const session = await AttendanceSession.findById(sessionId).select('teacherId');

      if (!session) {
        return res.status(404).json({ error: 'SESSION_NOT_FOUND' });
      }
      if (!isOwnedBy(session, ownerIds)) {
        return res.status(403).json({ error: 'FORBIDDEN' });
      }

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

      // Send initial connection message
      res.write(`event: connected\ndata: ${JSON.stringify({ sessionId })}\n\n`);

      // Register this client for updates
      sseManager.addClient(sessionId, res);

      // Keep connection alive with periodic comments
      const keepAlive = setInterval(() => {
        res.write(': keepalive\n\n');
      }, 30000);

      // Clean up on client disconnect
      req.on('close', () => {
        clearInterval(keepAlive);
        sseManager.removeClient(sessionId, res);
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route   GET /api/sse/status
 * @desc    Get SSE connection status (for debugging)
 * @access  Private (should be admin in production)
 */
router.get('/status', authenticate, (req, res) => {
  res.json({
    activeConnections: sseManager.getActiveConnections(),
    watchedSessions: sseManager.getWatchedSessions(),
  });
});

module.exports = router;
