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
  const student = await Student.findOne({ userId }).select('_id userId subjects');

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

function isOwnedBy(subjectOrSession, ownerIds) {
  const ownerId = normalizeId(subjectOrSession?.teacherId);
  return ownerIds.includes(ownerId);
}

module.exports = {
  getTeacherIdentityByUserId,
  getStudentIdentityByUserId,
  isOwnedBy,
  normalizeId,
};
