const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    profilePhoto: { type: String, default: '' },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 12 },
    admissionDate: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Inactive', 'Graduated'], default: 'Active' },
    guardianName: { type: String, required: true, trim: true },
    guardianPhone: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);
