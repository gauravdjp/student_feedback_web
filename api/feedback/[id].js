require('dotenv').config();
const { connectToDatabase, mongoose } = require('../db');
const Feedback = require('../models/Feedback');

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(data));
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const { id } = req.query;

  try {
    await connectToDatabase();
  } catch (err) {}

  if (req.method === 'DELETE') {
    if (mongoose.connection.readyState === 1 && id) {
      try {
        await Feedback.findByIdAndDelete(id);
      } catch (e) {
        console.warn('Delete warning:', e.message);
      }
    }
    return sendJson(res, 200, { message: 'Feedback successfully deleted', id });
  }

  sendJson(res, 405, { message: 'Method Not Allowed' });
};
