require('dotenv').config();
const { connectToDatabase, mongoose } = require('./db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let isConnected = mongoose.connection.readyState === 1;
  if (!isConnected) {
    try {
      await connectToDatabase();
      isConnected = mongoose.connection.readyState === 1;
    } catch (e) {}
  }

  res.json({
    status: 'OK',
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    database: isConnected ? 'Connected (MongoDB Atlas)' : 'Standby / Local Fallback',
    mongoReadyState: mongoose.connection.readyState,
    configuredUri: Boolean(process.env.MONGODB_URI)
  });
};
