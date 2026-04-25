const mongoose = require('mongoose');

const attendanceStatsSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    totalSessions: {
      type: Number,
      default: 0,
    },
    presentCount: {
      type: Number,
      default: 0,
    },
    absentCount: {
      type: Number,
      default: 0,
    },
    attendancePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index
attendanceStatsSchema.index({ studentId: 1, subjectId: 1 }, { unique: true });
attendanceStatsSchema.index({ studentId: 1 });

const AttendanceStats = mongoose.model('AttendanceStats', attendanceStatsSchema);

module.exports = AttendanceStats;
