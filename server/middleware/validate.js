const Joi = require('joi');

/**
 * Request Validation Middleware Factory
 * @param {Joi.Schema} schema - Joi schema to validate against
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 */
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: messages.join(', '),
        details: error.details,
      });
    }

    // Replace with validated/sanitized values
    req[property] = value;
    next();
  };
}

// Common validation schemas
const schemas = {
  // Auth schemas
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('TEACHER', 'STUDENT').required(),
    name: Joi.string().min(2).max(100).required(),
    // Teacher specific
    employeeId: Joi.string().when('role', {
      is: 'TEACHER',
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    department: Joi.string().when('role', {
      is: 'TEACHER',
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    // Student specific
    rollNumber: Joi.string().when('role', {
      is: 'STUDENT',
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    registrationNumber: Joi.string().when('role', {
      is: 'STUDENT',
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    branch: Joi.string().when('role', {
      is: 'STUDENT',
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    semester: Joi.number().min(1).max(8).when('role', {
      is: 'STUDENT',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  refresh: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  // Attendance schemas
  startSession: Joi.object({
    subjectId: Joi.string().required(),
  }),

  stopSession: Joi.object({
    sessionId: Joi.string().required(),
  }),

  markAttendance: Joi.object({
    sessionId: Joi.string().required(),
    qrData: Joi.string().required(),
    deviceInfo: Joi.string().optional(),
  }),
};

module.exports = {
  validate,
  schemas,
};
