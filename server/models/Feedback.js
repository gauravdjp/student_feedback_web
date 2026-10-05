const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  studentId: { type: String, required: true, trim: true },
  studentEmail: { type: String, trim: true },
  course: { type: String, required: true, trim: true },
  subject: { type: String, trim: true },
  teacherName: { type: String, required: true, trim: true },
  semester: { type: String, default: 'Semester 1' },
  academicYear: { type: String, default: '2025-2026' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  ratings: {
    content: { type: Number, min: 1, max: 5, default: 5 },
    delivery: { type: Number, min: 1, max: 5, default: 5 },
    labSupport: { type: Number, min: 1, max: 5, default: 5 },
    availability: { type: Number, min: 1, max: 5, default: 5 }
  },
  comments: { type: String, trim: true },
  suggestions: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
