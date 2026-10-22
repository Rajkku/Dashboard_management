const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    hod: { type: String, required: true, trim: true },
    studentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Department || mongoose.model('Department', departmentSchema);
