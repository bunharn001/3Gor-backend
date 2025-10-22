const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  getAllPortfolios,
  getPortfoliosByCategory,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} = require('../controllers/portfolioController');

router.get('/', getAllPortfolios);
router.get('/category/:category', getPortfoliosByCategory);
router.post('/', upload.fields([{ name: 'images', maxCount: 10 }]), createPortfolio);
router.put('/:id', upload.fields([{ name: 'images', maxCount: 10 }]), updatePortfolio);
router.delete('/:id', deletePortfolio);

module.exports = router;
