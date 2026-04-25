require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
    accessExpiry: '15m',
    refreshExpiry: '7d',
  },
  qr: {
    secret: process.env.QR_SECRET || 'dev-qr-secret-change-in-production',
    tokenExpiry: 2000, // 2 seconds in ms
  },
  bcrypt: {
    rounds: 12,
  },
};
