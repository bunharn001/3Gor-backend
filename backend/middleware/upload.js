const multer = require('multer');
const path = require('path');

// Define storage location and filename
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure the 'uploads' directory exists in your root server directory
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        // Use the original fieldname but append a timestamp to ensure uniqueness
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Configure and EXPORT THE MULTER INSTANCE
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        // Allow only image file types
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
}); 
// IMPORTANT: Do NOT call .array() here!

// Export the configured Multer instance (the object with .array, .single, etc., methods)
module.exports = upload;