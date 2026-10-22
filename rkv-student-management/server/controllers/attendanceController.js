const { store, matchesDepartment } = require('../utils/dataStore');

const listAttendance = (req, res) => {
  const { department = 'all', date = 'all' } = req.query;

  let results = [...store.attendance];

  if (department !== 'all') {
    const selectedDepartment = store.departments.find((item) =>
      item.name.toLowerCase() === String(department).toLowerCase() ||
      item.code.toLowerCase() === String(department).toLowerCase()
    );
    results = results.filter((entry) =>
      selectedDepartment
        ? matchesDepartment(entry.department, selectedDepartment)
        : entry.department.toLowerCase() === String(department).toLowerCase()
    );
  }

  if (date !== 'all') {
    results = results.filter((entry) => entry.date === date);
  }

  return res.status(200).json({ attendance: results });
};

const createAttendance = (req, res) => {
  const { studentId, status, date, department, semester, academicYear } = req.body;

  if (!studentId || !status || !date || !department) {
    return res.status(400).json({ message: 'Student, status, date, and department are required.' });
  }

  const student = store.students.find((item) => item.id === studentId || item.registrationNumber === studentId);
  if (!student) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  const duplicateEntry = store.attendance.some((record) =>
    record.studentId === student.id && record.date === date && record.department === department
  );

  if (duplicateEntry) {
    return res.status(409).json({ message: 'Attendance has already been marked for this student on the selected date.' });
  }

  const newEntry = {
    id: `ATT-${Date.now()}`,
    studentId: student.id,
    studentName: student.fullName,
    department: department || student.department,
    academicYear: academicYear || student.academicYear,
    semester: semester || student.semester,
    date,
    status,
  };

  store.attendance.push(newEntry);
  return res.status(201).json({ attendance: newEntry });
};

const getAttendanceReport = (req, res) => {
  const stats = store.students.map((student) => {
    const records = store.attendance.filter((entry) => entry.studentId === student.id);
    const total = records.length || 1;
    const present = records.filter((entry) => entry.status === 'Present').length;
    const percentage = Math.round((present / total) * 100);

    return {
      studentId: student.id,
      name: student.fullName,
      department: student.department,
      percentage,
      present,
      total,
    };
  });

  return res.status(200).json({ report: stats });
};

module.exports = {
  listAttendance,
  createAttendance,
  getAttendanceReport,
};
