const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const studentRoutes = require('./studentRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const subjectRoutes = require('./subjectRoutes');
const sseRoutes = require('./sseRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/students', studentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/subjects', subjectRoutes);
router.use('/sse', sseRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
