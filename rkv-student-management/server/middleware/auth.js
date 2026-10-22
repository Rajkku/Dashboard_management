const jwt = require('jsonwebtoken');
const { store } = require('../utils/dataStore');

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = store.users.find((item) => item.email === payload.email);

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  }

  next();
};

module.exports = { requireAuth, requireRole };
