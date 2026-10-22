const { store, syncDepartmentStudentCounts, matchesDepartment } = require('../utils/dataStore');

const listDepartments = (req, res) => {
  syncDepartmentStudentCounts();
  return res.status(200).json({ departments: store.departments });
};

const createDepartment = (req, res) => {
  const { name, code, hod } = req.body;

  if (!name || !code || !hod) {
    return res.status(400).json({ message: 'Department name, code, and HOD are required.' });
  }

  const exists = store.departments.some((department) => department.name.toLowerCase() === name.toLowerCase() || department.code.toLowerCase() === code.toLowerCase());
  if (exists) {
    return res.status(409).json({ message: 'Department with the same name or code already exists.' });
  }

  const newDepartment = {
    id: `dept-${Date.now()}`,
    name,
    code: code.toUpperCase(),
    hod,
    studentCount: 0,
  };

  store.departments.push(newDepartment);
  syncDepartmentStudentCounts();

  return res.status(201).json({ department: newDepartment });
};

const updateDepartment = (req, res) => {
  const departmentIndex = store.departments.findIndex((department) => department.id === req.params.id);

  if (departmentIndex === -1) {
    return res.status(404).json({ message: 'Department not found.' });
  }

  const { name, code, hod } = req.body;
  const updated = { ...store.departments[departmentIndex], name, code: code.toUpperCase(), hod };

  store.departments[departmentIndex] = updated;
  syncDepartmentStudentCounts();

  return res.status(200).json({ department: updated });
};

const deleteDepartment = (req, res) => {
  const department = store.departments.find((item) => item.id === req.params.id);

  if (!department) {
    return res.status(404).json({ message: 'Department not found.' });
  }

  const hasStudents = store.students.some((student) => matchesDepartment(student.department, department));
  if (hasStudents) {
    return res.status(400).json({ message: 'Department cannot be deleted while it has associated student records.' });
  }

  store.departments = store.departments.filter((item) => item.id !== req.params.id);
  syncDepartmentStudentCounts();

  return res.status(200).json({ message: 'Department deleted successfully.' });
};

module.exports = {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
