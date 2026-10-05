require('dotenv').config();
const { connectToDatabase, mongoose } = require('../db');
const Feedback = require('../models/Feedback');

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(data));
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  try {
    await connectToDatabase();
  } catch (err) {
    console.warn('DB stats connection note:', err.message);
  }

  const isConnected = mongoose.connection.readyState === 1;

  let list = [];
  if (isConnected) {
    try {
      list = await Feedback.find().lean();
    } catch (e) {
      list = [];
    }
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

  return sendJson(res, 200, {
    total,
    avgRating: parseFloat(avgRating),
    ratingDistribution: ratingCounts,
    courseDistribution: courseCounts,
    databaseStatus: isConnected ? 'Connected (MongoDB Atlas)' : 'Standby / Local Storage'
  });
};
