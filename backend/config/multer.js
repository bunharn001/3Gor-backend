// config/cloudinary-multer.js - IMPROVED with better error handling
const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

console.log('🔧 Initializing Cloudinary configuration...');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify configuration
console.log('☁️ Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing',
  api_key: process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing',
});

// Create Cloudinary storage with improved error handling
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    console.log(`📤 Preparing upload for: ${file.originalname}`);
    return {
      folder: '3gor-interior',
      allowed_formats: ['jpeg', 'jpg', 'png', 'gif'],
      public_id: `${Date.now()}_${file.originalname.replace(/\.[^/.]+$/, "")}`, // Remove extension, add timestamp
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    };
  },
});

// Create multer upload instance with improved error handling
const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // Increased to 10MB
  },
  fileFilter: (req, file, cb) => {
    console.log(`🔍 Checking file: ${file.originalname}, type: ${file.mimetype}`);
    
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      console.log(`✅ File accepted: ${file.originalname}`);
      return cb(null, true);
    } else {
      console.error(`❌ File rejected: ${file.originalname} (invalid type: ${file.mimetype})`);
      cb(new Error(`Only image files are allowed. Received: ${file.mimetype}`));
    }
  },
});

// Store original methods
const originalFields = upload.fields.bind(upload);
const originalSingle = upload.single.bind(upload);
const originalArray = upload.array.bind(upload);

// Enhanced fields method with better error handling
upload.fields = function(fields) {
  return function(req, res, next) {
    console.log(`📤 Processing multi-field upload:`, fields);
    
    originalFields(fields)(req, res, (err) => {
      if (err) {
        console.error(`❌ Upload error details:`, {
          message: err.message,
          code: err.code,
          stack: err.stack
        });
        
        return res.status(400).json({
          success: false,
          message: `Upload failed: ${err.message}`,
          error: err.code || 'UPLOAD_ERROR'
        });
      }

      // Log successful uploads with detailed info
      if (req.files) {
        let totalUploaded = 0;
        Object.keys(req.files).forEach(fieldName => {
          const files = req.files[fieldName];
          if (files && files.length > 0) {
            console.log(`🌟 SUCCESS: ${files.length} files uploaded for field '${fieldName}':`);
            files.forEach((file, index) => {
              console.log(`   ${index + 1}. ${file.originalname}`);
              console.log(`      📍 URL: ${file.path}`);
              console.log(`      📁 Public ID: ${file.filename}`);
              console.log(`      📊 Size: ${file.size} bytes`);
              totalUploaded++;
            });
          }
        });
        console.log(`🎉 Total files uploaded: ${totalUploaded}`);
      } else {
        console.log('ℹ️ No files were uploaded in this request');
      }

      next();
    });
  };
};

// Enhanced single method
upload.single = function(fieldname) {
  return function(req, res, next) {
    console.log(`📤 Processing single file upload for field: ${fieldname}`);
    
    originalSingle(fieldname)(req, res, (err) => {
      if (err) {
        console.error(`❌ Single upload error:`, {
          message: err.message,
          code: err.code
        });
        
        return res.status(400).json({
          success: false,
          message: `Upload failed: ${err.message}`,
          error: err.code || 'UPLOAD_ERROR'
        });
      }

      if (req.file) {
        console.log(`🌟 SUCCESS: Single file uploaded!`);
        console.log(`   📍 URL: ${req.file.path}`);
        console.log(`   📁 Public ID: ${req.file.filename}`);
        console.log(`   📊 Size: ${req.file.size} bytes`);
      }

      next();
    });
  };
};

// Enhanced array method
upload.array = function(fieldname, maxCount) {
  return function(req, res, next) {
    console.log(`📤 Processing array upload for field: ${fieldname}, max: ${maxCount}`);
    
    originalArray(fieldname, maxCount)(req, res, (err) => {
      if (err) {
        console.error(`❌ Array upload error:`, {
          message: err.message,
          code: err.code
        });
        
        return res.status(400).json({
          success: false,
          message: `Upload failed: ${err.message}`,
          error: err.code || 'UPLOAD_ERROR'
        });
      }

      if (req.files && req.files.length > 0) {
        console.log(`🌟 SUCCESS: ${req.files.length} files uploaded!`);
        req.files.forEach((file, index) => {
          console.log(`   ${index + 1}. ${file.originalname} -> ${file.path}`);
        });
      }

      next();
    });
  };
};

console.log('✅ Cloudinary multer configuration completed');

module.exports = upload;