// config/cloudinary-multer.js - UPDATED to work with your existing routes
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
      }

      if (req.files) {
        // Handle upload.fields() case
        Object.keys(req.files).forEach(fieldName => {
          const files = req.files[fieldName];
          if (files && files.length > 0) {
            console.log(`🌟 SUCCESS: ${files.length} files uploaded to Cloudinary for field '${fieldName}'!`);
            files.forEach((file, index) => {
              console.log(`   ${index + 1}. ${file.originalname} -> ${file.path}`);
            });
          }
        });
      }

      next();
    });
  };
};

// Export both the basic upload (for your existing routes) and the enhanced version
module.exports = {
  upload,              // ✅ This works with your upload.fields() syntax
  uploadWithCloudinaryLogging,
  cloudinary
};

/* 
🔧 HOW THIS WORKS WITH YOUR EXISTING CODE:

Your current route:
router.post('/',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  createProduct
);

After the fix:
- upload.fields() now uses Cloudinary storage instead of local storage
- req.files.image[0].path = Cloudinary URL (instead of local path)
- req.files.images[].path = Array of Cloudinary URLs (instead of local paths)
- Your controller code doesn't need to change!

🎯 RESULT: 
- Files go to Cloudinary (permanent)
- Your existing route structure stays the same
- No controller changes needed
- 404 errors disappear forever!
*/