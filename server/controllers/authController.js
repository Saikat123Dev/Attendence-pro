const authService = require('../services/authService');

/**
 * Register a new user
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      message: 'Registration successful',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken);
    res.json({
      message: 'Token refreshed',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current user
 * GET /api/auth/me
 */
async function me(req, res, next) {
  try {
    const user = await authService.getFullUser(req.user.sub);
    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

/**
 * Update user profile (e.g., semester for students)
 * PUT /api/auth/profile
 */
async function updateProfile(req, res, next) {
  try {
    const result = await authService.updateProfile(req.user.sub, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Complete user profile (set role)
 * POST /api/auth/complete-profile
 */
async function completeProfile(req, res, next) {
  try {
    const result = await authService.completeProfile(req.user.sub, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  completeProfile,
  updateProfile,
};
