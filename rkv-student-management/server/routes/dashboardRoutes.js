const express = require('express');
const { getDashboardStatsController, getUsers } = require('../controllers/dashboardController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', requireAuth, getDashboardStatsController);
router.get('/users', requireAuth, requireRole('admin'), getUsers);

module.exports = router;
