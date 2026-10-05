require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectToDatabase, mongoose } = require('./db');
const feedbackRoutes = require('./routes/feedback');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static frontend in local mode or direct express run
app.use(express.static(path.join(__dirname, '..', 'public')));

// Connect to MongoDB asynchronously
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
    environment: process.env.NODE_ENV || 'development',
    database: isConnected ? 'Connected (MongoDB Atlas)' : 'Standby / Local Fallback',
    mongoReadyState: mongoose.connection.readyState,
    configuredUri: Boolean(process.env.MONGODB_URI)
  });
});

// Mount Routes on all possible path variants
app.use('/api/feedback', feedbackRoutes);
app.use('/feedback', feedbackRoutes);

// Fallback to index.html for client-side single page navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Export Express app for Vercel Serverless Function
module.exports = app;
