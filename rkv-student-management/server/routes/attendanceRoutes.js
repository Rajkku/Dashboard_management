const express = require('express');
const { listAttendance, createAttendance, getAttendanceReport } = require('../controllers/attendanceController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, listAttendance);
router.get('/report', requireAuth, getAttendanceReport);
router.post('/', requireAuth, requireRole('admin', 'faculty'), createAttendance);

module.exports = router;
