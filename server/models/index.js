// Re-export all models for convenience
module.exports = {
  User: require('./User'),
  Student: require('./Student'),
  Teacher: require('./Teacher'),
  Subject: require('./Subject'),
  AttendanceSession: require('./AttendanceSession'),
  AttendanceRecord: require('./AttendanceRecord'),
  AttendanceStats: require('./AttendanceStats'),
  RefreshToken: require('./RefreshToken'),
};
