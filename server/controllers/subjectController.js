const Subject = require('../models/Subject');
const Student = require('../models/Student');

/**
 * Get all subjects for current teacher
 * GET /api/subjects
 */
async function getMySubjects(req, res, next) {
  try {
    const teacherId = req.user.sub;

    const subjects = await Subject.find({ teacherId })
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

    const subject = await Subject.findById(id)
      .populate('teacherId', 'name employeeId department');

    if (!subject) {
      return res.status(404).json({ error: 'SUBJECT_NOT_FOUND' });
    }

    // Check if teacher owns this subject
    if (subject.teacherId._id.toString() !== req.user.sub && req.user.role !== 'TEACHER') {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    // Get enrolled students
    const students = await Student.find({ subjects: id })
      .select('name rollNumber branch semester')
      .sort({ rollNumber: 1 });

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
    const teacherId = req.user.sub;

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
      teacherId,
      branch: branch.toUpperCase(),
      semester: parseInt(semester, 10),
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
    const { name, branch, semester } = req.body;

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ error: 'SUBJECT_NOT_FOUND' });
    }

    if (subject.teacherId.toString() !== req.user.sub) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    if (name) subject.name = name;
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

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ error: 'SUBJECT_NOT_FOUND' });
    }

    if (subject.teacherId.toString() !== req.user.sub) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    // Remove subject from all students
    await Student.updateMany(
      { subjects: id },
      { $pull: { subjects: id } }
    );

    await Subject.findByIdAndDelete(id);

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

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ error: 'SUBJECT_NOT_FOUND' });
    }

    if (subject.teacherId.toString() !== req.user.sub) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    // Add subject to each student's subjects array
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $addToSet: { subjects: id } }
    );

    // Update subject's enrolled students count
    const enrolledStudents = await Student.countDocuments({ subjects: id });

    res.json({
      message: `Enrolled ${studentIds.length} students`,
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

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ error: 'SUBJECT_NOT_FOUND' });
    }

    if (subject.teacherId.toString() !== req.user.sub) {
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

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ error: 'SUBJECT_NOT_FOUND' });
    }

    if (subject.teacherId.toString() !== req.user.sub) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    // Build query for available students
    const query = {
      _id: { $nin: await Student.find({ subjects: id }).distinct('_id') },
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
    const studentId = req.user.sub;

    const student = await Student.findById(studentId)
      .populate('subjects')
      .select('subjects');

    if (!student) {
      return res.status(404).json({ error: 'STUDENT_NOT_FOUND' });
    }

    res.json({ subjects: student.subjects || [] });
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
};
