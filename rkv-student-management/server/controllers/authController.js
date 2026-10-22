const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { store } = require('../utils/dataStore');

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = store.users.find((item) => item.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const access = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

  return res.status(200).json({
    access,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};

const getCurrentUser = (req, res) => {
  return res.status(200).json({ user: req.user });
};

module.exports = { login, getCurrentUser };
