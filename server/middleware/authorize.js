const { resolveUserRoleByUserId } = require('../utils/profileResolver');

/**
 * Role-Based Authorization Middleware
 * Checks if user has one of the required roles
 * @param  {...string} allowedRoles - Roles allowed to access the route
 */
function authorize(...allowedRoles) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'NOT_AUTHENTICATED',
          message: 'Authentication required',
        });
      }

      const tokenRole = typeof req.user.role === 'string' ? req.user.role.toUpperCase() : null;
      if (tokenRole && allowedRoles.includes(tokenRole)) {
        req.user.role = tokenRole;
        return next();
      }

      const resolvedRole = await resolveUserRoleByUserId(req.user.sub);
      if (resolvedRole) {
        req.user.role = resolvedRole;
      }

      if (resolvedRole && allowedRoles.includes(resolvedRole)) {
        return next();
      }

      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = authorize;
