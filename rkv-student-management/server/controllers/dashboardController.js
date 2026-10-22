const { getDashboardStats, store } = require('../utils/dataStore');

const getDashboardStatsController = (req, res) => {
  const stats = getDashboardStats();
  return res.status(200).json({ stats });
};

const getUsers = (req, res) => {
  return res.status(200).json({ users: store.users.map((user) => ({ id: user.id, name: user.name, email: user.email, role: user.role })) });
};

module.exports = {
  getDashboardStatsController,
  getUsers,
};
