const Joi = require('joi');
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

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
    name: Joi.string().min(2).max(100).required(),
  }),

  completeProfile: Joi.object({
    role: Joi.string().uppercase().valid('TEACHER', 'STUDENT').required(),
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
    subjectId: objectId.required(),
  }),

  stopSession: Joi.object({
    sessionId: objectId.required(),
  }),

  markAttendance: Joi.object({
    sessionId: objectId.required(),
    qrData: Joi.string().required(),
    deviceInfo: Joi.string().optional(),
  }),

  // Subject schemas
  subjectIdParam: Joi.object({
    id: objectId.required(),
  }),

  sessionIdParam: Joi.object({
    id: objectId.required(),
  }),

  studentIdParam: Joi.object({
    id: objectId.required(),
  }),

  createSubject: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    code: Joi.string().trim().uppercase().min(2).max(20).required(),
    branch: Joi.string().trim().uppercase().min(2).max(50).required(),
    semester: Joi.number().integer().min(1).max(8).required(),
  }),

  updateSubject: Joi.object({
    name: Joi.string().trim().min(2).max(120).optional(),
    code: Joi.string().trim().uppercase().min(2).max(20).optional(),
    branch: Joi.string().trim().uppercase().min(2).max(50).optional(),
    semester: Joi.number().integer().min(1).max(8).optional(),
  }).min(1),

  subjectStudentBulk: Joi.object({
    studentIds: Joi.array()
      .items(objectId.required())
      .min(1)
      .required(),
  }),

  addStudentToSubject: Joi.object({
    subjectId: objectId.required(),
  }),
};

module.exports = {
  validate,
  schemas,
};
