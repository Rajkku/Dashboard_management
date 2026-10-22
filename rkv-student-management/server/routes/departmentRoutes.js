const express = require('express');
const { listDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, listDepartments);
router.post('/', requireAuth, requireRole('admin'), createDepartment);
router.put('/:id', requireAuth, requireRole('admin'), updateDepartment);
router.delete('/:id', requireAuth, requireRole('admin'), deleteDepartment);

module.exports = router;
