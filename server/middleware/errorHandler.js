/**
 * Global Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: messages.join(', '),
    });
  }

  // express-rate-limit misconfiguration error (e.g. on Render without trust proxy)
  if (err.code === 'ERR_ERL_UNEXPECTED_X_FORWARDED_FOR') {
    console.error('[RateLimiter] Trust proxy not configured correctly:', err.message);
    // Don't block the user — just skip rate limiting for this request
    return res.status(500).json({
      error: 'SERVER_CONFIG_ERROR',
      message: 'Server configuration error. Please try again.',
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue?.[field];
    const friendlyField = field === 'email' ? 'email address' : field;
    return res.status(409).json({
      error: 'DUPLICATE_ENTRY',
      message: field === 'email'
        ? `An account with this email already exists. Please login instead.`
        : `This ${friendlyField} is already taken: ${value}`,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'INVALID_ID',
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'TOKEN_EXPIRED',
      message: 'Token has expired',
    });
  }

  // Default server error
  const statusCode = err.status || 500;
  return res.status(statusCode).json({
    error: statusCode !== 500 ? (err.error || 'REQUEST_ERROR') : 'SERVER_ERROR',
    message: statusCode !== 500 ? err.message : 'Internal server error',
  });
}

module.exports = errorHandler;
