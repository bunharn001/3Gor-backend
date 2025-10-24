// test-cloudinary-connection.js - Test your Cloudinary setup
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

console.log('🔧 Testing Cloudinary Connection');
console.log('================================\n');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'dw8lktyqr',
  api_key: '834787743694456',
  api_secret: 'yG_UI6V6hJ9VjKh-bk8sBKezNLA',
});

// Test 1: Basic connection
async function testConnection() {
  try {
    console.log('📡 Testing basic connection...');
    const result = await cloudinary.api.ping();
    console.log('✅ Connection successful!');
    console.log('Status:', result.status);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error.message);
    return false;
  }
}

// Test 2: Upload a test image
async function testUpload() {
  try {
    console.log('\n📤 Testing image upload...');
    
    // Upload a simple test image (base64 encoded 1x1 pixel)
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const result = await cloudinary.uploader.upload(testImageData, {
      folder: '3gor-interior',
      public_id: 'test-upload-' + Date.now()
    });
    
    console.log('✅ Upload successful!');
    console.log('📸 Image URL:', result.secure_url);
    console.log('📁 Public ID:', result.public_id);
    
    // Clean up the test image
    await cloudinary.uploader.destroy(result.public_id);
    console.log('🧹 Test image cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Upload test failed:');
    console.error(error.message);
    return false;
  }
}

// Test 3: Check folder access
async function testFolderAccess() {
  try {
    console.log('\n📁 Testing folder access...');
    
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: '3gor-interior/',
      max_results: 5
    });
    
    console.log('✅ Folder access successful!');
    console.log(`📊 Found ${result.resources.length} existing images in 3gor-interior folder`);
    
    if (result.resources.length > 0) {
      console.log('📋 Recent images:');
      result.resources.forEach((resource, index) => {
        console.log(`   ${index + 1}. ${resource.public_id}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Folder access test failed:');
    console.error(error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🔍 Running Cloudinary setup verification...\n');
  
  const connectionTest = await testConnection();
  const uploadTest = connectionTest ? await testUpload() : false;
  const folderTest = connectionTest ? await testFolderAccess() : false;
  
  console.log('\n🎯 TEST RESULTS');
  console.log('===============');
  console.log(`📡 Connection: ${connectionTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📤 Upload: ${uploadTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📁 Folder Access: ${folderTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (connectionTest && uploadTest && folderTest) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Your Cloudinary setup is working perfectly!');
    console.log('✅ You can now replace your multer config with the Cloudinary version.');
    console.log('✅ Uploaded images will never disappear again!');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED');
    console.log('❌ Please check your credentials and try again.');
    console.log('💡 Make sure you added the credentials to your .env file correctly.');
  }
}

// Run the tests
runAllTests().catch(console.error);