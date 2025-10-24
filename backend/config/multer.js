// config/cloudinary-multer.js - Replace your existing multer config with this
const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage that replaces your local storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: '3gor-interior', // All your images will be organized in this folder
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' }, // Resize large images
      { quality: 'auto' }, // Automatic quality optimization
      { fetch_format: 'auto' } // Automatic format optimization (WebP when supported)
    ]
  },
});

// Create multer upload with Cloudinary storage
const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      console.log(`✅ Uploading ${file.originalname} to Cloudinary...`);
      return cb(null, true);
    } else {
      console.error(`❌ Invalid file type: ${file.originalname}`);
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif)"));
    }
  },
});

// Enhanced upload middleware with success logging
const uploadWithCloudinaryLogging = (fieldName, maxCount = 1) => {
  const uploadHandler = maxCount === 1 ? upload.single(fieldName) : upload.array(fieldName, maxCount);
  
  return (req, res, next) => {
    uploadHandler(req, res, (err) => {
      if (err) {
        console.error(`❌ Cloudinary upload error for ${fieldName}:`, err.message);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      // Log successful uploads
      if (req.file) {
        console.log(`🌟 SUCCESS: ${req.file.originalname} uploaded to Cloudinary!`);
        console.log(`🔗 URL: ${req.file.path}`);
        console.log(`📁 Public ID: ${req.file.filename}`);
        console.log(`📊 Size: ${req.file.size || 'optimized'} bytes`);
      }

      if (req.files && req.files.length > 0) {
        console.log(`🌟 SUCCESS: ${req.files.length} files uploaded to Cloudinary!`);
        req.files.forEach((file, index) => {
          console.log(`   ${index + 1}. ${file.originalname} -> ${file.path}`);
        });
      }

      next();
    });
  };
};

// Export both the basic upload and the enhanced version
module.exports = {
  upload,
  uploadWithCloudinaryLogging,
  cloudinary
};

// config/cloudinary-multer.js - Replace your existing multer config with this
const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage that replaces your local storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: '3gor-interior', // All your images will be organized in this folder
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' }, // Resize large images
      { quality: 'auto' }, // Automatic quality optimization
      { fetch_format: 'auto' } // Automatic format optimization (WebP when supported)
    ]
  },
});

// Create multer upload with Cloudinary storage
const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      console.log(`✅ Uploading ${file.originalname} to Cloudinary...`);
      return cb(null, true);
    } else {
      console.error(`❌ Invalid file type: ${file.originalname}`);
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif)"));
    }
  },
});

// Enhanced upload middleware with success logging
const uploadWithCloudinaryLogging = (fieldName, maxCount = 1) => {
  const uploadHandler = maxCount === 1 ? upload.single(fieldName) : upload.array(fieldName, maxCount);
  
  return (req, res, next) => {
    uploadHandler(req, res, (err) => {
      if (err) {
        console.error(`❌ Cloudinary upload error for ${fieldName}:`, err.message);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      // Log successful uploads
      if (req.file) {
        console.log(`🌟 SUCCESS: ${req.file.originalname} uploaded to Cloudinary!`);
        console.log(`🔗 URL: ${req.file.path}`);
        console.log(`📁 Public ID: ${req.file.filename}`);
        console.log(`📊 Size: ${req.file.size || 'optimized'} bytes`);
      }

      if (req.files && req.files.length > 0) {
        console.log(`🌟 SUCCESS: ${req.files.length} files uploaded to Cloudinary!`);
        req.files.forEach((file, index) => {
          console.log(`   ${index + 1}. ${file.originalname} -> ${file.path}`);
        });
      }

      next();
    });
  };
};

// Export both the basic upload and the enhanced version
module.exports = {
  upload,
  uploadWithCloudinaryLogging,
  cloudinary
};

/* 
🔧 HOW TO USE THIS:

1. Replace your existing config/multer.js with this file

2. Add these to your .env file:
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key  
   CLOUDINARY_API_SECRET=your_api_secret

3. Install required packages:
   npm install cloudinary multer-storage-cloudinary

4. Update your route files:
   
   OLD:
   const upload = require('../config/multer');
   
   NEW:
   const { uploadWithCloudinaryLogging } = require('../config/cloudinary-multer');
   
5. Update your route handlers:
   
   OLD:
   router.post('/upload', upload.single('image'), (req, res) => {
     // req.file.path was a local path that disappears
   });
   
   NEW:
   router.post('/upload', uploadWithCloudinaryLogging('image'), (req, res) => {
     // req.file.path is now a permanent Cloudinary URL!
   });

6. Your database will automatically store Cloudinary URLs instead of local paths:
   Before: "/uploads/image-1234567890.jpg" ❌ (disappears)
   After:  "https://res.cloudinary.com/your-cloud/image/upload/v1234/3gor-interior/abc123.jpg" ✅ (permanent)

7. No frontend changes needed! Your frontend will receive the new URLs automatically.

🎯 RESULT: Your uploaded images will NEVER disappear again!
*/