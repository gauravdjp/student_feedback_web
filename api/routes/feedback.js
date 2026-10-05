const express = require('express');
const router = express.Router();
const { connectToDatabase, mongoose } = require('../db');
const Feedback = require('../models/Feedback');

// Fallback seed data in memory for preview when DB is initializing
let inMemoryFeedbacks = [
  {
    _id: 'seed-001',
    studentName: 'Aarav Sharma',
    studentId: 'CS2023014',
    studentEmail: 'aarav.sharma@campus.edu',
    course: 'Computer Science & Engineering',
    subject: 'Data Structures & Algorithms',
    teacherName: 'Dr. Ramesh Kulkarni',
    semester: 'Semester 4',
    academicYear: '2025-2026',
    rating: 5,
    ratings: { content: 5, delivery: 5, labSupport: 4, availability: 5 },
    comments: 'Excellent teaching methodology with practical examples. The DSA coding sessions and problem-solving workshops were very engaging!',
    suggestions: 'More real-world coding case studies in competitive programming would be wonderful.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    _id: 'seed-002',
    studentName: 'Priya Patel',
    studentId: 'IT2023089',
    studentEmail: 'priya.patel@campus.edu',
    course: 'Information Technology',
    subject: 'Database Management Systems',
    teacherName: 'Prof. Ananya Sen',
    semester: 'Semester 4',
    academicYear: '2025-2026',
    rating: 4,
    ratings: { content: 4, delivery: 4, labSupport: 5, availability: 4 },
    comments: 'The SQL and MongoDB hands-on lab sessions were super helpful. The professor clarifies all doubts promptly.',
    suggestions: 'Provide sample question papers before mid-term exams.',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: 'seed-003',
    studentName: 'Rohan Verma',
    studentId: 'EC2023045',
    studentEmail: 'rohan.v@campus.edu',
    course: 'Electronics & Communication',
    subject: 'Microprocessors & Microcontrollers',
    teacherName: 'Dr. Vikramaditya Rao',
    semester: 'Semester 5',
    academicYear: '2025-2026',
    rating: 5,
    ratings: { content: 5, delivery: 4, labSupport: 5, availability: 5 },
    comments: 'Very thorough explanation of assembly architecture and hardware interfacing.',
    suggestions: 'Extend the lab hours for hardware kit experiments.',
    createdAt: new Date().toISOString()
  }
];

// Middleware to ensure DB connection before route handling
router.use(async (req, res, next) => {
  try {
    await connectToDatabase();
  } catch (err) {
    // proceed; routes handle fallback gracefully
  }
  next();
});

// GET all feedback
router.get('/', async (req, res) => {
  const { course, rating, search } = req.query;

  if (mongoose.connection.readyState === 1) {
    try {
      const query = {};
      if (course) query.course = course;
      if (rating) query.rating = Number(rating);
      if (search) {
        query.$or = [
          { studentName: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } },
          { teacherName: { $regex: search, $options: 'i' } },
          { course: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } }
        ];
      }
      const feedbacks = await Feedback.find(query).sort({ createdAt: -1 }).lean();
      return res.json({
        source: 'MongoDB',
        count: feedbacks.length,
        data: feedbacks
      });
    } catch (err) {
      console.warn('MongoDB query warning:', err.message);
    }
  }

  // Fallback in-memory
  let list = [...inMemoryFeedbacks];
  if (course) {
    list = list.filter(item => item.course === course);
  }
  if (rating) {
    list = list.filter(item => item.rating === Number(rating));
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(item =>
      (item.studentName && item.studentName.toLowerCase().includes(s)) ||
      (item.studentId && item.studentId.toLowerCase().includes(s)) ||
      (item.teacherName && item.teacherName.toLowerCase().includes(s)) ||
      (item.course && item.course.toLowerCase().includes(s)) ||
      (item.subject && item.subject.toLowerCase().includes(s))
    );
  }

  res.json({
    source: mongoose.connection.readyState === 1 ? 'MongoDB' : 'Standby / Local Storage',
    count: list.length,
    data: list
  });
});

// GET statistics
router.get('/stats', async (req, res) => {
  let list = [];
  if (mongoose.connection.readyState === 1) {
    try {
      list = await Feedback.find().lean();
    } catch (err) {
      list = inMemoryFeedbacks;
    }
  } else {
    list = inMemoryFeedbacks;
  }

  const total = list.length;
  const avgRating = total > 0 
    ? (list.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0) / total).toFixed(1) 
    : '0.0';

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const courseCounts = {};

  list.forEach(item => {
    const r = Math.round(Number(item.rating)) || 0;
    if (ratingCounts[r] !== undefined) ratingCounts[r]++;
    if (item.course) {
      courseCounts[item.course] = (courseCounts[item.course] || 0) + 1;
    }
  });

  res.json({
    total,
    avgRating: parseFloat(avgRating),
    ratingDistribution: ratingCounts,
    courseDistribution: courseCounts,
    databaseStatus: mongoose.connection.readyState === 1 ? 'Connected (MongoDB)' : 'Standby / Local Storage'
  });
});

// GET single feedback
router.get('/:id', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const item = await Feedback.findById(req.params.id);
      if (item) return res.json(item);
    } catch (err) {}
  }

  const found = inMemoryFeedbacks.find(item => item._id === req.params.id);
  if (!found) return res.status(404).json({ message: 'Feedback not found' });
  res.json(found);
});

// POST new feedback
router.post('/', async (req, res) => {
  const {
    studentName,
    studentId,
    studentEmail,
    course,
    subject,
    teacherName,
    semester,
    academicYear,
    rating,
    ratings,
    comments,
    suggestions
  } = req.body;

  if (!studentName || !studentId || !course || !teacherName || !rating) {
    return res.status(400).json({
      message: 'Please provide all required fields: studentName, studentId, course, teacherName, rating.'
    });
  }

  const feedbackData = {
    studentName: studentName.trim(),
    studentId: studentId.trim(),
    studentEmail: (studentEmail || '').trim(),
    course: course.trim(),
    subject: (subject || '').trim(),
    teacherName: teacherName.trim(),
    semester: semester || 'Current Semester',
    academicYear: academicYear || '2025-2026',
    rating: Number(rating),
    ratings: ratings || { content: rating, delivery: rating, labSupport: rating, availability: rating },
    comments: (comments || '').trim(),
    suggestions: (suggestions || '').trim(),
    createdAt: new Date()
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const feedback = new Feedback(feedbackData);
      const saved = await feedback.save();
      return res.status(201).json(saved);
    } catch (err) {
      console.warn('MongoDB save warning:', err.message);
    }
  }

  // Fallback in memory
  const newItem = {
    _id: 'fb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    ...feedbackData,
    createdAt: new Date().toISOString()
  };
  inMemoryFeedbacks.unshift(newItem);
  res.status(201).json(newItem);
});

// DELETE feedback
router.delete('/:id', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await Feedback.findByIdAndDelete(req.params.id);
    } catch (err) {
      console.warn('MongoDB delete warning:', err.message);
    }
  }

  inMemoryFeedbacks = inMemoryFeedbacks.filter(item => item._id !== req.params.id);
  res.json({ message: 'Feedback successfully deleted', id: req.params.id });
});

module.exports = router;
