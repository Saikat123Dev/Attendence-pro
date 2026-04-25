const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication endpoints
 * Prevents brute force attacks on login/register
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
});

/**
 * Rate limiter for general API endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for attendance marking
 * Students shouldn't mark attendance too frequently
 */
const attendanceLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 3, // 3 marks per 10 seconds
  message: {
    error: 'TOO_MANY_REQUESTS',
    message: 'Please wait before marking attendance again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for QR token generation
 * Prevents abuse of QR endpoint
 */
const qrLimiter = rateLimit({
  windowMs: 1 * 1000, // 1 second
  max: 5, // 5 requests per second
  message: {
    error: 'TOO_MANY_REQUESTS',
    message: 'QR generation rate exceeded.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  apiLimiter,
  attendanceLimiter,
  qrLimiter,
};
