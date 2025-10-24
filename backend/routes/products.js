// routes/products.js - FIXED VERSION for your exact code
const express = require('express');
const router = express.Router();

// ❌ REMOVE this line:
// const upload = require('../config/multer');

// ✅ REPLACE with this:
const { upload } = require('../config/multer');

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} = require('../controllers/productController');

// ✅ Routes stay exactly the same - just the upload source changes
router.get('/category/:category', getProductsByCategory);

router.get('/', getAllProducts);
router.get('/:id', getProductById);

// ✅ This upload.fields() will now use Cloudinary instead of local storage
router.post(
  '/',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  createProduct
);

router.put(
  '/:id',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  updateProduct
);

router.delete('/:id', deleteProduct);

module.exports = router;