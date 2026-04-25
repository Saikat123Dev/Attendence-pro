/**
 * Role-Based Authorization Middleware
 * Checks if user has one of the required roles
 * @param  {...string} allowedRoles - Roles allowed to access the route
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'NOT_AUTHENTICATED',
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
    }

    next();
  };
}

module.exports = authorize;
