// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const path = require('path'); 

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize app
const app = express();

// Body parser middleware
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// ✅ Serve uploaded images

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/promotions', require('./routes/promotions'));
app.use('/api/portfolios', require('./routes/portfolios')); 
app.use('/uploads', express.static('uploads'));


// Root route
app.get('/', (req, res) => {
  res.json({
    message: '3Gor Interior API',
    version: '1.0.0'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
