const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studentFeedbackDB';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection with timeout
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 2000
})
  .then(() => {
    console.log(`✅ Successfully connected to MongoDB at ${MONGODB_URI}`);
  })
  .catch((err) => {
    console.warn(`⚠️  MongoDB connection note: Could not connect to ${MONGODB_URI} (${err.message}).`);
    console.warn(`ℹ️  Running in Standby / Fallback mode with local JSON persistence enabled.`);
    console.warn(`💡 To use full MongoDB: ensure MongoDB daemon (mongod) is running or set MONGODB_URI env var.`);
  });

// Health & Status API
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'OK',
    serverTime: new Date().toISOString(),
    database: isConnected ? 'Connected (MongoDB)' : 'Standby / Local Storage Fallback',
    mongoReadyState: mongoose.connection.readyState
  });
});

// API Routes
app.use('/api/feedback', feedbackRoutes);

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Student Feedback Server is running on http://localhost:${PORT}`);
  console.log(`📖 Open http://localhost:${PORT} in your browser to view the application.`);
});
