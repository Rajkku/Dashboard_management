const express = require('express');
const { listFaculty, createFaculty, updateFaculty, deleteFaculty } = require('../controllers/facultyController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, listFaculty);
router.post('/', requireAuth, requireRole('admin'), createFaculty);
router.put('/:id', requireAuth, requireRole('admin'), updateFaculty);
router.delete('/:id', requireAuth, requireRole('admin'), deleteFaculty);

module.exports = router;
