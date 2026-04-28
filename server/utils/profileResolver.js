const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

function normalizeId(id) {
  return id?.toString();
}

async function getTeacherIdentityByUserId(userId) {
  const teacher = await Teacher.findOne({ userId }).select('_id userId');

  if (!teacher) {
    throw Object.assign(new Error('TEACHER_PROFILE_NOT_FOUND'), {
      status: 404,
      error: 'TEACHER_PROFILE_NOT_FOUND',
    });
  }

  return {
    teacher,
    teacherId: normalizeId(teacher._id),
    userId: normalizeId(userId),
    ownerIds: [normalizeId(teacher._id), normalizeId(userId)],
  };
}

async function getStudentIdentityByUserId(userId) {
  const student = await Student.findOne({ userId }).select(
    '_id userId subjects branch semester'
  );

  if (!student) {
    throw Object.assign(new Error('STUDENT_PROFILE_NOT_FOUND'), {
      status: 404,
      error: 'STUDENT_PROFILE_NOT_FOUND',
    });
  }

  return {
    student,
    studentId: normalizeId(student._id),
    userId: normalizeId(userId),
    ownerIds: [normalizeId(student._id), normalizeId(userId)],
  };
}

async function resolveUserRoleByUserId(userId) {
  const user = await User.findById(userId).select('role');

  if (user?.role) {
    return user.role.toUpperCase();
  }

  const teacher = await Teacher.exists({ userId });
  if (teacher) {
    return 'TEACHER';
  }

  const student = await Student.exists({ userId });
  if (student) {
    return 'STUDENT';
  }

  return null;
}

function isOwnedBy(subjectOrSession, ownerIds) {
  const ownerId = normalizeId(subjectOrSession?.teacherId);
  return ownerIds.includes(ownerId);
}

module.exports = {
  getTeacherIdentityByUserId,
  getStudentIdentityByUserId,
  resolveUserRoleByUserId,
  isOwnedBy,
  normalizeId,
};
