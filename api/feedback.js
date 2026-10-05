require('dotenv').config();
const express = require('express');
const cors = require('cors');
const feedbackRoutes = require('./routes/feedback');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Mount feedback routes on all possible subpaths so Vercel can never 404
app.use('/api/feedback', feedbackRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/', feedbackRoutes);

module.exports = app;
