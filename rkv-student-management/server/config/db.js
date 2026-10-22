const mongoose = require('mongoose');

const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.log('MONGO_URI not provided; using in-memory data store.');
    return null;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully.');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    return null;
  }
};

module.exports = { connectDatabase };
