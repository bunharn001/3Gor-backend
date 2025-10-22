const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory, // ✅ new controller
} = require('../controllers/productController');

// ✅ new route must come before '/:id'
router.get('/category/:category', getProductsByCategory);

router.get('/', getAllProducts);
router.get('/:id', getProductById);
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
