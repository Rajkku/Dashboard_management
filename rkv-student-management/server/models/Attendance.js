const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    semester: { type: Number, required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'On Leave'], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
