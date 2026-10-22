const express = require('express');
const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const departmentRoutes = require('./departmentRoutes');
const facultyRoutes = require('./facultyRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/departments', departmentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
