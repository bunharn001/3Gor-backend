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
// Enable CORS for multiple origins dynamically
const allowedOrigins = [
  "http://localhost:3000", // local dev
  "https://heroic-macaron-256616.netlify.app", // Netlify site
  "https://www.3gorinterior.com", // your GoDaddy domain (www)
  "https://3gorinterior.com" // your GoDaddy domain (non-www)
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ CORS blocked request from:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
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
