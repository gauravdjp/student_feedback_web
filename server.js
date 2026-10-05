require('dotenv').config();
const app = require('./api/index');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Student Feedback System is live!`);
  console.log(`📍 Local URL:     http://localhost:${PORT}`);
  console.log(`📦 Environment:   ${process.env.NODE_ENV || 'development'}`);
  console.log(`🍃 MongoDB URI:   ${process.env.MONGODB_URI ? 'Provided (Connected/Connecting)' : 'Not set (Using Standby Storage)'}`);
  console.log(`=======================================================`);
});
