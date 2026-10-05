require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectToDatabase, mongoose } = require('./api/db');
const feedbackRoutes = require('./api/routes/feedback');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ensure MongoDB is connected
connectToDatabase().catch((err) => {
  console.warn('Initial MongoDB connection attempt deferred:', err.message);
});

// Health & Database Connection API
app.get(['/api/health', '/health'], async (req, res) => {
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
});

// Feedback API Routes (matches both /api/feedback and /feedback)
app.use('/api/feedback', feedbackRoutes);
app.use('/feedback', feedbackRoutes);

// Static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback for GET requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start local server if not running inside Vercel serverless environment
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Student Feedback System is live!`);
    console.log(`📍 Local URL:     http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

// CRUCIAL FOR VERCEL DEPLOYMENT: Export the Express app
module.exports = app;
