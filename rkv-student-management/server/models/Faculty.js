const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    facultyId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    joiningDate: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Faculty || mongoose.model('Faculty', facultySchema);
