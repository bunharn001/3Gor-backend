const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion
} = require('../controllers/promotionController');

// ✅ Use fields() to support both single & multiple uploads
router.post(
  '/',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  createPromotion
);

router.put(
  '/:id',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  updatePromotion
);

// Read routes
router.get('/', getAllPromotions);
router.get('/:id', getPromotionById);

// Delete
router.delete('/:id', deletePromotion);

module.exports = router;
