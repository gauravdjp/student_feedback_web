require('dotenv').config();
const { connectToDatabase, mongoose } = require('../db');
const Feedback = require('../models/Feedback');

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(data));
}

// In-memory fallback
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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  // Connect to DB
  try {
    await connectToDatabase();
  } catch (err) {
    console.warn('DB connection note:', err.message);
  }

  const isConnected = mongoose.connection.readyState === 1;

  // GET /api/feedback
  if (req.method === 'GET') {
    const { course, rating, search } = req.query || {};

    if (isConnected) {
      try {
        const mongoQuery = {};
        if (course) mongoQuery.course = course;
        if (rating) mongoQuery.rating = Number(rating);
        if (search) {
          mongoQuery.$or = [
            { studentName: { $regex: search, $options: 'i' } },
            { studentId: { $regex: search, $options: 'i' } },
            { teacherName: { $regex: search, $options: 'i' } },
            { course: { $regex: search, $options: 'i' } },
            { subject: { $regex: search, $options: 'i' } }
          ];
        }
        const feedbacks = await Feedback.find(mongoQuery).sort({ createdAt: -1 }).lean();
        return sendJson(res, 200, {
          source: 'MongoDB',
          count: feedbacks.length,
          data: feedbacks
        });
      } catch (err) {
        console.warn('MongoDB query fallback:', err.message);
      }
    }

    let list = [...inMemoryFeedbacks];
    if (course) list = list.filter(item => item.course === course);
    if (rating) list = list.filter(item => item.rating === Number(rating));
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

    return sendJson(res, 200, {
      source: isConnected ? 'MongoDB' : 'Standby / Local Storage',
      count: list.length,
      data: list
    });
  }

  // POST /api/feedback
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }
    body = body || {};

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
    } = body;

    if (!studentName || !studentId || !course || !teacherName || !rating) {
      return sendJson(res, 400, {
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

    if (isConnected) {
      try {
        const feedback = new Feedback(feedbackData);
        const saved = await feedback.save();
        return sendJson(res, 201, saved);
      } catch (err) {
        console.error('MongoDB save error in serverless function:', err.message);
      }
    }

    const newItem = {
      _id: 'fb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      ...feedbackData,
      createdAt: new Date().toISOString()
    };
    inMemoryFeedbacks.unshift(newItem);
    return sendJson(res, 201, newItem);
  }

  sendJson(res, 405, { message: 'Method Not Allowed' });
};
