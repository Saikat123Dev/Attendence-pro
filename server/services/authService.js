const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

/**
 * Generate access and refresh tokens for a user
 * @param {Object} user - User document
 * @returns {Object} { accessToken, refreshToken }
 */
async function generateTokens(user) {
  const jti = uuidv4();

  const accessToken = jwt.sign(
    {
      sub: user._id,
      role: user.role,
      type: 'ACCESS',
      email: user.email,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiry }
  );

  const refreshToken = jwt.sign(
    {
      sub: user._id,
      type: 'REFRESH',
      jti,
    },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry }
  );

  // Calculate refresh token expiry (7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Store refresh token in database
  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    expiresAt,
  });

  return { accessToken, refreshToken };
}

/**
 * Verify and decode refresh token
 * @param {string} token - Refresh token
 * @returns {Object} Decoded token payload
 */
async function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, config.jwt.refreshSecret);

  // Check if token exists in database
  const storedToken = await RefreshToken.findOne({
    token,
    userId: decoded.sub,
  });

  if (!storedToken) {
    throw new Error('TOKEN_NOT_FOUND');
  }

  return decoded;
}

/**
 * Revoke a refresh token (logout)
 * @param {string} token - Token to revoke
 */
async function revokeRefreshToken(token) {
  await RefreshToken.deleteOne({ token });
}

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} { user, accessToken, refreshToken }
 */
async function register(userData) {
  const { email, password, name } = userData;

  // Create user with only basic info - profile completed in next step
  const user = await User.create({
    email,
    password,
    name,
  });

  // Generate tokens
  const tokens = await generateTokens(user);

  // Return user (no profile yet)
  const fullUser = await getFullUser(user._id);

  return { user: fullUser, ...tokens };
}

/**
 * Complete user profile after registration
 * @param {string} userId - User ID from JWT
 * @param {Object} profileData - Role + role-specific fields
 * @returns {Object} { user }
 */
async function completeProfile(userId, profileData) {
  const { role, ...roleSpecificData } = profileData;

  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404, error: 'USER_NOT_FOUND' });
  }

  if (user.role) {
    throw Object.assign(new Error('Profile already completed'), { status: 400, error: 'PROFILE_ALREADY_COMPLETE' });
  }

  // Set role on user
  user.role = role;
  await user.save();

  // Generate new tokens with the correct role
  const tokens = await generateTokens(user);

  // Create role-specific profile
  if (role === 'STUDENT') {
    await Student.create({
      userId: user._id,
      name: user.name,
      rollNumber: roleSpecificData.rollNumber,
      registrationNumber: roleSpecificData.registrationNumber,
      branch: roleSpecificData.branch,
      semester: roleSpecificData.semester,
      subjects: [],
    });
  } else if (role === 'TEACHER') {
    await Teacher.create({
      userId: user._id,
      name: user.name,
      employeeId: roleSpecificData.employeeId,
      department: roleSpecificData.department,
      subjects: [],
    });
  }

  const fullUser = await getFullUser(user._id);
  return { user: fullUser, ...tokens };
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} { user, accessToken, refreshToken }
 */
async function login(email, password) {
  const user = await User.findOne({ email });

  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401, error: 'INVALID_CREDENTIALS' });
  }

  if (!user.isActive) {
    throw Object.assign(new Error('Your account has been disabled. Please contact support.'), { status: 403, error: 'ACCOUNT_DISABLED' });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401, error: 'INVALID_CREDENTIALS' });
  }

  const tokens = await generateTokens(user);
  const fullUser = await getFullUser(user._id);

  return { user: fullUser, ...tokens };
}

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Current refresh token
 * @returns {Object} { accessToken, refreshToken: newRefreshToken }
 */
async function refresh(refreshToken) {
  // Verify the refresh token
  const decoded = await verifyRefreshToken(refreshToken);

  // Get user
  const user = await User.findById(decoded.sub);

  if (!user || !user.isActive) {
    throw Object.assign(new Error('User not found or account is inactive'), { status: 401, error: 'USER_NOT_FOUND' });
  }

  // Revoke old refresh token
  await revokeRefreshToken(refreshToken);

  // Generate new tokens
  const tokens = await generateTokens(user);

  return tokens;
}

/**
 * Logout - revoke refresh token
 * @param {string} refreshToken - Token to revoke
 */
async function logout(refreshToken) {
  await revokeRefreshToken(refreshToken);
}

/**
 * Get full user with profile data based on role
 * @param {string} userId - User ID
 * @returns {Object} User with profile
 */
async function getFullUser(userId) {
  const user = await User.findById(userId);

  if (!user) return null;

  let profile = null;

  if (user.role === 'STUDENT') {
    profile = await Student.findOne({ userId: user._id }).populate('subjects');
  } else if (user.role === 'TEACHER') {
    profile = await Teacher.findOne({ userId: user._id }).populate('subjects');
  }

  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    ...(profile && { profile }),
  };
}

module.exports = {
  register,
  login,
  logout,
  refresh,
  generateTokens,
  getFullUser,
  completeProfile,
};
