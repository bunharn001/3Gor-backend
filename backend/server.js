// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const path = require('path');
const fs = require('fs');

// 🧩 Catch top-level crashes (shows everything)
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
});

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();
setTimeout(() => {
  const Product = require('./models/Product');
  console.log('🧩 Product schema fields:', Object.keys(Product.schema.paths));
  console.log('🧱 Type of "specifications" field:', Product.schema.path('specifications').instance);
}, 3000);


// Initialize app
const app = express();

// ✅ Log every incoming request BEFORE anything else
app.use((req, res, next) => {
  console.log(`📩 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// Body parser middleware (for JSON and forms)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static uploaded images
app.use('/uploads', express.static(uploadsDir));

// ✅ CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://heroic-macaron-256616.netlify.app",
  "https://www.3gorinterior.com",
  "https://3gorinterior.com"
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

// ✅ Explicit log when routes load
console.log("🛣️ Registering routes...");

// ✅ API routes
app.use('/api/products', require('./routes/products'));
app.use('/api/promotions', require('./routes/promotions'));
app.use('/api/portfolios', require('./routes/portfolios'));


// Root route
app.get('/', (req, res) => {
  res.json({
    message: '3Gor Interior API',
    version: '1.0.0',
  });
});

// ✅ 404 fallback for missing routes
app.use((req, res) => {
  console.warn(`⚠️ 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: "Route not found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Global error handler caught:", err);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
