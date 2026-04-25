const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'STOPPED'],
      default: 'ACTIVE',
    },
    currentToken: {
      type: String,
    },
    currentTokenExpiry: {
      type: Date,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    stoppedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSessionSchema.index({ teacherId: 1 });
attendanceSessionSchema.index({ subjectId: 1 });
attendanceSessionSchema.index({ status: 1 });

const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);

module.exports = AttendanceSession;
