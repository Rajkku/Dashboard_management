const { store } = require('../utils/dataStore');

const listFaculty = (req, res) => {
  return res.status(200).json({ faculty: store.faculty });
};

const createFaculty = (req, res) => {
  const { facultyId, name, email, phone, department, designation, joiningDate, status } = req.body;

  if (!facultyId || !name || !email || !department) {
    return res.status(400).json({ message: 'Faculty ID, name, email, and department are required.' });
  }

  const exists = store.faculty.some((member) => member.facultyId === facultyId || member.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ message: 'Faculty ID or email is already in use.' });
  }

  const newFaculty = {
    id: `FAC-${Date.now()}`,
    facultyId,
    name,
    email,
    phone,
    department,
    designation,
    joiningDate,
    status: status || 'Active',
  };

  store.faculty.push(newFaculty);
  return res.status(201).json({ faculty: newFaculty });
};

const updateFaculty = (req, res) => {
  const facultyIndex = store.faculty.findIndex((member) => member.id === req.params.id || member.facultyId === req.params.id);

  if (facultyIndex === -1) {
    return res.status(404).json({ message: 'Faculty member not found.' });
  }

  const updatedFaculty = {
    ...store.faculty[facultyIndex],
    ...req.body,
  };

  store.faculty[facultyIndex] = updatedFaculty;
  return res.status(200).json({ faculty: updatedFaculty });
};

const deleteFaculty = (req, res) => {
  const facultyIndex = store.faculty.findIndex((member) => member.id === req.params.id || member.facultyId === req.params.id);

  if (facultyIndex === -1) {
    return res.status(404).json({ message: 'Faculty member not found.' });
  }

  const [removed] = store.faculty.splice(facultyIndex, 1);
  return res.status(200).json({ message: 'Faculty member deleted successfully.', faculty: removed });
};

module.exports = {
  listFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};
