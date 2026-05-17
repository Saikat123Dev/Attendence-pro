const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { resolveUserRoleByUserId } = require('../utils/profileResolver');

function getUserId(user) {
  return user?._id || user?.id || user?.sub || null;
}

function mapDuplicateProfileError(err) {
  if (err?.code !== 11000) {
    return err;
  }

  const duplicateField = Object.keys(err.keyPattern || {})[0] || 'field';
  const duplicateValue = err.keyValue?.[duplicateField];

  return Object.assign(new Error(`${duplicateField} already exists`), {
    status: 409,
    error: 'DUPLICATE_ENTRY',
    field: duplicateField,
    value: duplicateValue,
  });
}

/**
 * Generate access and refresh tokens for a user
 * @param {Object} user - User document
 * @returns {Object} { accessToken, refreshToken }
 */
async function generateTokens(user) {
  const userId = getUserId(user);
  if (!userId) {
    throw Object.assign(new Error('Cannot generate tokens without a user id'), {
      status: 500,
      error: 'TOKEN_GENERATION_FAILED',
    });
  }

  const jti = uuidv4();

  const accessToken = jwt.sign(
    {
      sub: userId,
      role: user.role,
      type: 'ACCESS',
      email: user.email,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiry }
  );

  const refreshToken = jwt.sign(
    {
      sub: userId,
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
    userId,
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
    throw Object.assign(new Error('Refresh token not found or already revoked'), {
      status: 401,
      error: 'TOKEN_NOT_FOUND',
    });
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
  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser && !existingUser.role) {
    const passwordMatches = await existingUser.comparePassword(password);
    if (passwordMatches) {
      const tokens = await generateTokens(existingUser);
      const fullUser = await getFullUser(existingUser._id);
      return { user: fullUser, ...tokens };
    }
  }

  // Create user with only basic info - profile completed in next step
  let user;
  try {
    user = await User.create({
      email: normalizedEmail,
      password,
      name,
    });
  } catch (err) {
    if (err.code === 11000 && err.keyValue?.email) {
      const conflictingUser = await User.findOne({ email: normalizedEmail });
      if (conflictingUser && !conflictingUser.role) {
        const passwordMatches = await conflictingUser.comparePassword(password);
        if (passwordMatches) {
          const tokens = await generateTokens(conflictingUser);
          const fullUser = await getFullUser(conflictingUser._id);
          return { user: fullUser, ...tokens };
        }
      }
      // Existing user (with role already set, or different password) → clear error so client knows to login
      err.error = 'DUPLICATE_ENTRY';
      err.status = 409;
    }
    throw err;
  }

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
  const normalizedRole = profileData.role?.toUpperCase();
  if (!['TEACHER', 'STUDENT'].includes(normalizedRole)) {
    throw Object.assign(new Error('Invalid role'), { status: 400, error: 'INVALID_ROLE' });
  }

  const { role, ...roleSpecificData } = {
    ...profileData,
    role: normalizedRole,
  };

  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404, error: 'USER_NOT_FOUND' });
  }

  // Allow re-completing the same role (idempotent), but block changing to a different role.
  if (user.role && user.role.toUpperCase() !== normalizedRole) {
    throw Object.assign(new Error('Profile role mismatch'), {
      status: 400,
      error: 'PROFILE_ROLE_MISMATCH',
    });
  }

  try {
    // Create or update the role-specific profile first so a unique-key conflict
    // does not leave the account with a role but without the matching profile.
    if (normalizedRole === 'STUDENT') {
      await Student.findOneAndUpdate(
        { userId: user._id },
        {
          $set: {
            userId: user._id,
            name: user.name,
            rollNumber: roleSpecificData.rollNumber?.trim().toUpperCase(),
            registrationNumber: roleSpecificData.registrationNumber?.trim().toUpperCase(),
            branch: roleSpecificData.branch?.trim().toUpperCase(),
            semester: roleSpecificData.semester,
          },
          $setOnInsert: { subjects: [] },
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );
    } else if (normalizedRole === 'TEACHER') {
      await Teacher.findOneAndUpdate(
        { userId: user._id },
        {
          $set: {
            userId: user._id,
            name: user.name,
            employeeId: roleSpecificData.employeeId?.trim().toUpperCase(),
            department: roleSpecificData.department?.trim().toUpperCase(),
          },
          $setOnInsert: { subjects: [] },
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );
    }
  } catch (err) {
    throw mapDuplicateProfileError(err);
  }

  const effectiveUser =
    user.role && user.role.toUpperCase() === normalizedRole
      ? user
      : await User.findByIdAndUpdate(
          user._id,
          { $set: { role: normalizedRole } },
          { new: true, runValidators: true }
        );

  if (!effectiveUser) {
    throw Object.assign(new Error('User not found'), { status: 404, error: 'USER_NOT_FOUND' });
  }

  const tokens = await generateTokens(effectiveUser);
  const fullUser = await getFullUser(effectiveUser._id);
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

  const resolvedRole = user.role ? user.role.toUpperCase() : await resolveUserRoleByUserId(user._id);
  const role = resolvedRole || user.role || null;

  let profile = null;

  if (role === 'STUDENT') {
    profile = await Student.findOne({ userId: user._id }).populate('subjects');
  } else if (role === 'TEACHER') {
    profile = await Teacher.findOne({ userId: user._id }).populate('subjects');
  }

  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    ...(profile && { profile }),
  };
}

/**
 * Update user profile (semester for students, etc.)
 * @param {string} userId - User ID from JWT
 * @param {Object} profileData - Fields to update
 * @returns {Object} { user }
 */
async function updateProfile(userId, profileData) {
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404, error: 'USER_NOT_FOUND' });
  }

  if (!user.role) {
    throw Object.assign(new Error('Profile not completed yet'), { status: 400, error: 'PROFILE_INCOMPLETE' });
  }

  // Only allow semester update for students currently
  if (user.role.toUpperCase() === 'STUDENT') {
    const normalizedRole = 'STUDENT';

    if (profileData.semester !== undefined) {
      const semester = parseInt(profileData.semester, 10);
      if (!Number.isInteger(semester) || semester < 1 || semester > 8) {
        throw Object.assign(new Error('Semester must be between 1 and 8'), { status: 400, error: 'INVALID_SEMESTER' });
      }

      await Student.findOneAndUpdate(
        { userId: user._id },
        { $set: { semester } },
        { new: true, runValidators: true }
      );
    }
  }

  const fullUser = await getFullUser(user._id);
  return { user: fullUser };
}

module.exports = {
  register,
  login,
  logout,
  refresh,
  generateTokens,
  getFullUser,
  completeProfile,
  updateProfile,
};
