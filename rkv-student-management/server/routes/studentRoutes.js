const express = require('express');
const { listStudents, getStudentById, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, listStudents);
router.get('/:id', requireAuth, getStudentById);
router.post('/', requireAuth, requireRole('admin', 'faculty'), createStudent);
router.put('/:id', requireAuth, requireRole('admin', 'faculty'), updateStudent);
router.delete('/:id', requireAuth, requireRole('admin'), deleteStudent);

module.exports = router;
