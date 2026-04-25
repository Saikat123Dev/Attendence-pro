const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * JWT Authentication Middleware
 * Verifies access token and attaches user to request
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'NO_TOKEN',
      message: 'Authorization header with Bearer token required',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    // Validate token type
    if (decoded.type !== 'ACCESS') {
      return res.status(401).json({
        error: 'INVALID_TOKEN_TYPE',
        message: 'Invalid token type',
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: 'Access token has expired',
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'INVALID_TOKEN',
        message: 'Invalid token',
      });
    }

    return res.status(401).json({
      error: 'AUTH_ERROR',
      message: 'Authentication failed',
    });
  }
}

module.exports = authenticate;
