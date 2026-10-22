const { store, syncDepartmentStudentCounts, matchesDepartment } = require('../utils/dataStore');

const parseStudentPayload = (body) => ({
  registrationNumber: body.registrationNumber,
  fullName: body.fullName,
  profilePhoto: body.profilePhoto || '',
  dob: body.dob,
  gender: body.gender,
  email: body.email,
  phone: body.phone,
  address: body.address,
  department: body.department,
  course: body.course,
  academicYear: body.academicYear,
  semester: Number(body.semester),
  admissionDate: body.admissionDate,
  status: body.status || 'Active',
  guardianName: body.guardianName,
  guardianPhone: body.guardianPhone,
});

const listStudents = (req, res) => {
  const { search = '', department = 'all', status = 'all', semester = 'all', academicYear = 'all' } = req.query;

  let results = [...store.students];

  if (search) {
    const query = search.toLowerCase();
    results = results.filter((student) => 
      [student.fullName, student.registrationNumber, student.email].some((field) =>
        String(field).toLowerCase().includes(query)
      )
    );
  }

  if (department !== 'all') {
    const selectedDepartment = store.departments.find((item) =>
      item.name.toLowerCase() === String(department).toLowerCase() ||
      item.code.toLowerCase() === String(department).toLowerCase()
    );
    results = results.filter((student) =>
      selectedDepartment
        ? matchesDepartment(student.department, selectedDepartment)
        : student.department.toLowerCase() === String(department).toLowerCase()
    );
  }

  if (status !== 'all') {
    results = results.filter((student) => student.status === status);
  }

  if (semester !== 'all') {
    results = results.filter((student) => String(student.semester) === String(semester));
  }

  if (academicYear !== 'all') {
    results = results.filter((student) => student.academicYear === academicYear);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const paginated = results.slice(startIndex, startIndex + limit);

  return res.status(200).json({
    students: paginated,
    pagination: {
      total: results.length,
      page,
      limit,
      pages: Math.ceil(results.length / limit) || 1,
    },
  });
};

const getStudentById = (req, res) => {
  const student = store.students.find((item) => item.id === req.params.id || item.registrationNumber === req.params.id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  return res.status(200).json({ student });
};

const createStudent = (req, res) => {
  const payload = parseStudentPayload(req.body);

  if (!payload.registrationNumber || !payload.fullName || !payload.email) {
    return res.status(400).json({ message: 'Student registration number, name, and email are required.' });
  }

  const duplicateRegistration = store.students.some((student) => student.registrationNumber === payload.registrationNumber);
  const duplicateEmail = store.students.some((student) => student.email.toLowerCase() === payload.email.toLowerCase());

  if (duplicateRegistration) {
    return res.status(409).json({ message: 'A student with this registration number already exists.' });
  }

  if (duplicateEmail) {
    return res.status(409).json({ message: 'A student with this email already exists.' });
  }

  const newStudent = {
    id: `STU-${Date.now()}`,
    ...payload,
  };

  store.students.push(newStudent);
  syncDepartmentStudentCounts();

  return res.status(201).json({ student: newStudent });
};

const updateStudent = (req, res) => {
  const studentIndex = store.students.findIndex((student) => student.id === req.params.id || student.registrationNumber === req.params.id);

  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  const payload = parseStudentPayload(req.body);
  const existing = store.students[studentIndex];

  if (payload.registrationNumber && payload.registrationNumber !== existing.registrationNumber) {
    const duplicate = store.students.some((student) => student.registrationNumber === payload.registrationNumber && student.id !== existing.id);
    if (duplicate) {
      return res.status(409).json({ message: 'A student with this registration number already exists.' });
    }
  }

  if (payload.email && payload.email.toLowerCase() !== existing.email.toLowerCase()) {
    const duplicate = store.students.some((student) => student.email.toLowerCase() === payload.email.toLowerCase() && student.id !== existing.id);
    if (duplicate) {
      return res.status(409).json({ message: 'A student with this email already exists.' });
    }
  }

  const updatedStudent = {
    ...existing,
    ...payload,
  };

  store.students[studentIndex] = updatedStudent;
  syncDepartmentStudentCounts();

  return res.status(200).json({ student: updatedStudent });
};

const deleteStudent = (req, res) => {
  const studentIndex = store.students.findIndex((student) => student.id === req.params.id || student.registrationNumber === req.params.id);

  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  const [removed] = store.students.splice(studentIndex, 1);
  syncDepartmentStudentCounts();

  return res.status(200).json({ message: 'Student deleted successfully.', student: removed });
};

module.exports = {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
