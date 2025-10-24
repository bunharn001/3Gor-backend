// test-cloudinary-in-production.js - Add this route to test Cloudinary on Render
const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// Test endpoint to verify Cloudinary is working on production
router.get('/test-cloudinary', async (req, res) => {
  try {
    console.log('🔧 Testing Cloudinary connection in production...');
    
    // Check if credentials are set
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };
    
    console.log('🔍 Environment variables check:', {
      CLOUDINARY_CLOUD_NAME: config.cloud_name ? '✅ Set' : '❌ Missing',
      CLOUDINARY_API_KEY: config.api_key ? '✅ Set' : '❌ Missing',
      CLOUDINARY_API_SECRET: config.api_secret ? '✅ Set' : '❌ Missing',
    });
    
    // Configure Cloudinary
    cloudinary.config(config);
    
    // Test ping
    const pingResult = await cloudinary.api.ping();
    console.log('✅ Cloudinary ping successful:', pingResult);
    
    // Test upload with a tiny base64 image
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const uploadResult = await cloudinary.uploader.upload(testImage, {
      folder: '3gor-interior',
      public_id: 'production-test-' + Date.now()
    });
    
    console.log('✅ Test upload successful:', uploadResult.secure_url);
    
    // Clean up test image
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('🧹 Test image cleaned up');
    
    res.json({
      success: true,
      message: 'Cloudinary is working perfectly in production!',
      details: {
        ping: pingResult.status,
        upload_test: 'successful',
        test_url: uploadResult.secure_url
      }
    });
    
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Cloudinary test failed',
      error: {
        message: error.message,
        code: error.code,
        details: error
      },
      environment_check: {
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing',
      }
    });
  }
});

module.exports = router;

/*
🔧 HOW TO USE:

1. Add this to your server.js:
   app.use('/api/test', require('./routes/test-cloudinary'));

2. Visit in browser:
   https://threegor-1.onrender.com/api/test/test-cloudinary

3. Check the response to see if Cloudinary is configured correctly

This will help diagnose the "undefined" error you're seeing.
*/