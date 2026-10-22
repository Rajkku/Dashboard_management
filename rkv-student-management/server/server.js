require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectDatabase } = require('./config/db');
const { createInitialAdmin } = require('./utils/dataStore');
const apiRoutes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests. Please try again later.' },
  })
);
app.use('/api', apiRoutes);
app.use(errorHandler);

const startServer = async () => {
  await connectDatabase();
  await createInitialAdmin();

  app.listen(PORT, () => {
    console.log(`RKV Student Management API running on http://localhost:${PORT}`);
  });
};

startServer();
