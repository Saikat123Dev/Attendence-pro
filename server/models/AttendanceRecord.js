const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttendanceSession',
      required: true,
    },
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
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT'],
      default: 'PRESENT',
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
    deviceInfo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate attendance per session
attendanceRecordSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
attendanceRecordSchema.index({ studentId: 1, createdAt: -1 });
attendanceRecordSchema.index({ subjectId: 1, createdAt: -1 });
attendanceRecordSchema.index({ teacherId: 1 });

const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);

module.exports = AttendanceRecord;
