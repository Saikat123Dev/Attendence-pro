const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const AttendanceSession = require('../models/AttendanceSession');
const {
  getTeacherIdentityByUserId,
  getStudentIdentityByUserId,
  isOwnedBy,
} = require('../utils/profileResolver');

function isSubjectCompatibleWithStudent(subject, student) {
  return (
    subject.branch === student.branch &&
    Number(subject.semester) === Number(student.semester)
  );
}

/**
 * Get all subjects for current teacher
 * GET /api/subjects
 */
async function getMySubjects(req, res, next) {
  try {
    const { ownerIds } = await getTeacherIdentityByUserId(req.user.sub);

    const subjects = await Subject.find({ teacherId: { $in: ownerIds } })
      .populate('teacherId', 'name employeeId')
      .sort({ name: 1 });

    res.json({ subjects });
  } catch (err) {
    next(err);
  }
}

/**
 * Get subject by ID
 * GET /api/subjects/:id
 */
async function getSubjectById(req, res, next) {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ error: 'SUBJECT_NOT_FOUND' });
    }

    if (req.user.role === 'TEACHER') {
      const { ownerIds } = await getTeacherIdentityByUserId(req.user.sub);
      if (!isOwnedBy(subject, ownerIds)) {
        return res.status(403).json({ error: 'FORBIDDEN' });
      }
    } else if (req.user.role === 'STUDENT') {
      const { student } = await getStudentIdentityByUserId(req.user.sub);
      const isEnrolled = student.subjects.some(
        (subjectId) => subjectId.toString() === id
      );
      if (!isEnrolled) {
        return res.status(403).json({ error: 'FORBIDDEN' });
      }
    } else {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    // Get enrolled students
    const students = await Student.find({ subjects: id })
      .select('name rollNumber branch semester')
      .sort({ rollNumber: 1 });

    await subject.populate('teacherId', 'name employeeId department');

    res.json({
      subject,
      enrolledStudents: students,
      studentCount: students.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create new subject
 * POST /api/subjects
 * Teacher only
 */
async function createSubject(req, res, next) {
  try {
    const { name, code, branch, semester } = req.body;
    const { teacher } = await getTeacherIdentityByUserId(req.user.sub);

    // Check if code already exists
    const existing = await Subject.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        error: 'DUPLICATE_CODE',
        message: 'Subject code already exists',
      });
    }

    const subject = await Subject.create({
      name,
      code,
      teacherId: teacher._id,
      branch: branch.toUpperCase(),
      semester: parseInt(semester, 10),
    });

    await Teacher.findByIdAndUpdate(teacher._id, {
      $addToSet: { subjects: subject._id },
    });

    res.status(201).json({
      message: 'Subject created',
      subject,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update subject
 * PUT /api/subjects/:id
 * Teacher only
 */
async function updateSubject(req, res, next) {
  try {
    const { id } = req.params;
    const { name, code, branch, semester } = req.body;
    const { ownerIds } = await getTeacherIdentityByUserId(req.user.sub);

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ error: 'SUBJECT_NOT_FOUND' });
    }

    if (!isOwnedBy(subject, ownerIds)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    if (name) subject.name = name;
    if (code && code.toUpperCase() !== subject.code) {
      const existing = await Subject.findOne({ code: code.toUpperCase(), _id: { $ne: id } });
      if (existing) {
        return res.status(409).json({
          error: 'DUPLICATE_CODE',
          message: 'Subject code already exists',
        });
      }
      subject.code = code.toUpperCase();
    }
    if (branch) subject.branch = branch.toUpperCase();
    if (semester) subject.semester = parseInt(semester, 10);

    await subject.save();

    res.json({
      message: 'Subject updated',
      subject,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete subject
 * DELETE /api/subjects/:id
 * Teacher only
 */
async function deleteSubject(req, res, next) {
  try {
    const { id } = req.params;
    const { teacher, ownerIds } = await getTeacherIdentityByUserId(req.user.sub);

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ error: 'SUBJECT_NOT_FOUND' });
    }

    if (!isOwnedBy(subject, ownerIds)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    const activeSession = await AttendanceSession.findOne({ subjectId: id, status: 'ACTIVE' }).select('_id');
    if (activeSession) {
      return res.status(409).json({
        error: 'ACTIVE_SESSION_EXISTS',
        message: 'Stop the active attendance session before deleting this subject',
      });
    }

    // Remove subject from all students
    await Student.updateMany(
      { subjects: id },
      { $pull: { subjects: id } }
    );

    await Subject.findByIdAndDelete(id);
    await Teacher.findByIdAndUpdate(teacher._id, { $pull: { subjects: id } });

    res.json({ message: 'Subject deleted' });
  } catch (err) {
    next(err);
  }
}

/**
 * Enroll students in subject
 * POST /api/subjects/:id/enroll
 * Teacher only
 */
async function enrollStudents(req, res, next) {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;
    const { ownerIds } = await getTeacherIdentityByUserId(req.user.sub);

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ error: 'SUBJECT_NOT_FOUND' });
    }

    if (!isOwnedBy(subject, ownerIds)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length !== studentIds.length) {
      return res.status(400).json({
        error: 'INVALID_STUDENTS',
        message: 'One or more selected students could not be found',
      });
    }

    const incompatibleStudents = students.filter(
      (student) => !isSubjectCompatibleWithStudent(subject, student)
    );
    if (incompatibleStudents.length > 0) {
      return res.status(400).json({
        error: 'INCOMPATIBLE_STUDENTS',
        message: 'Students must match the subject branch and semester',
        students: incompatibleStudents.map((student) => ({
          _id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          branch: student.branch,
          semester: student.semester,
        })),
      });
    }

    // Add subject to each student's subjects array
    const result = await Student.updateMany(
      { _id: { $in: studentIds }, subjects: { $ne: id } },
      { $addToSet: { subjects: id } }
    );

    // Update subject's enrolled students count
    const enrolledStudents = await Student.countDocuments({ subjects: id });

    res.json({
      message: `Enrolled ${result.modifiedCount} students`,
      enrolledCount: result.modifiedCount,
      enrolledStudents,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Remove students from subject
 * POST /api/subjects/:id/unenroll
 * Teacher only
 */
async function unenrollStudents(req, res, next) {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;
    const { ownerIds } = await getTeacherIdentityByUserId(req.user.sub);

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ error: 'SUBJECT_NOT_FOUND' });
    }

    if (!isOwnedBy(subject, ownerIds)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    // Remove subject from each student's subjects array
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $pull: { subjects: id } }
    );

    const enrolledStudents = await Student.countDocuments({ subjects: id });

    res.json({
      message: `Unenrolled ${studentIds.length} students`,
      enrolledStudents,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get students not enrolled in subject (for enrollment UI)
 * GET /api/subjects/:id/available
 * Teacher only
 */
async function getAvailableStudents(req, res, next) {
  try {
    const { id } = req.params;
    const { branch, semester } = req.query;
    const { ownerIds } = await getTeacherIdentityByUserId(req.user.sub);

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ error: 'SUBJECT_NOT_FOUND' });
    }

    if (!isOwnedBy(subject, ownerIds)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    // Build query for compatible students not already enrolled in the subject.
    const query = {
      _id: { $nin: await Student.find({ subjects: id }).distinct('_id') },
      branch: subject.branch,
      semester: subject.semester,
    };

    if (branch) query.branch = branch.toUpperCase();
    if (semester) query.semester = parseInt(semester, 10);

    const students = await Student.find(query)
      .select('name rollNumber branch semester')
      .sort({ rollNumber: 1 })
      .limit(50);

    res.json({ students });
  } catch (err) {
    next(err);
  }
}

/**
 * Get student's enrolled subjects
 * GET /api/subjects/student
 */
async function getStudentSubjects(req, res, next) {
  try {
    const { student } = await getStudentIdentityByUserId(req.user.sub);
    const populatedStudent = await Student.findById(student._id)
      .populate('subjects')
      .select('subjects');

    if (!populatedStudent) {
      return res.status(404).json({ error: 'STUDENT_NOT_FOUND' });
    }

    res.json({ subjects: populatedStudent.subjects || [] });
  } catch (err) {
    next(err);
  }
}

/**
 * Get available subjects for students to browse
 * GET /api/subjects/available
 */
async function getAvailableSubjects(req, res, next) {
  try {
    const { branch, semester, includeEnrolled } = req.query;
    const query = {};

    if (req.user.role === 'STUDENT') {
      const { student } = await getStudentIdentityByUserId(req.user.sub);
      query.branch = student.branch;
      query.semester = student.semester;
      if (includeEnrolled !== 'true') {
        query._id = { $nin: student.subjects };
      }
    } else {
      if (branch) query.branch = branch.toUpperCase();
      if (semester) query.semester = parseInt(semester, 10);
    }

    const subjects = await Subject.find(query)
      .populate('teacherId', 'name department')
      .sort({ name: 1, code: 1 })
      .limit(200);

    res.json({ subjects });
  } catch (err) {
    next(err);
  }
}

/**
 * Enroll current student in a compatible subject
 * POST /api/subjects/:id/self-enroll
 * Student only
 */
async function selfEnrollSubject(req, res, next) {
  try {
    const { id } = req.params;
    const { student } = await getStudentIdentityByUserId(req.user.sub);

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ error: 'SUBJECT_NOT_FOUND' });
    }

    if (!isSubjectCompatibleWithStudent(subject, student)) {
      return res.status(400).json({
        error: 'INCOMPATIBLE_SUBJECT',
        message: 'This subject is not available for your branch and semester',
      });
    }

    const alreadyEnrolled = student.subjects.some(
      (subjectId) => subjectId.toString() === id
    );
    if (alreadyEnrolled) {
      await subject.populate('teacherId', 'name department');
      return res.json({
        message: 'Already enrolled in subject',
        subject,
      });
    }

    await Student.findByIdAndUpdate(student._id, {
      $addToSet: { subjects: id },
    });
    await subject.populate('teacherId', 'name department');

    res.status(201).json({
      message: 'Subject enrolled',
      subject,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Remove current student from an enrolled subject
 * POST /api/subjects/:id/self-unenroll
 * Student only
 */
async function selfUnenrollSubject(req, res, next) {
  try {
    const { id } = req.params;
    const { student } = await getStudentIdentityByUserId(req.user.sub);

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ error: 'SUBJECT_NOT_FOUND' });
    }

    await Student.findByIdAndUpdate(student._id, {
      $pull: { subjects: id },
    });

    res.json({ message: 'Subject removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMySubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  enrollStudents,
  unenrollStudents,
  getAvailableStudents,
  getStudentSubjects,
  getAvailableSubjects,
  selfEnrollSubject,
  selfUnenrollSubject,
};
