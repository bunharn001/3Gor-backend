const Promotion = require('../models/Promotion');

// ✅ Helper function for consistent URL formatting
const formatPromotion = (req, promo) => ({
  ...promo._doc,
  image: promo.image ? `${req.protocol}://${req.get('host')}${promo.image}` : null,
  images: Array.isArray(promo.images)
    ? promo.images.map(img => `${req.protocol}://${req.get('host')}${img}`)
    : [],
});

// ✅ GET all promotions
exports.getAllPromotions = async (req, res) => {
  try {
    // If you use an isActive field, only return active promotions
    const promotions = await Promotion.find({ isActive: { $ne: false } }).sort({ createdAt: -1 });
    const formatted = promotions.map(p => formatPromotion(req, p));

    res.json({ data: formatted }); // frontend expects { data: [...] }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET single promotion
exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) return res.status(404).json({ error: 'Not found' });

    res.json({ data: formatPromotion(req, promotion) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ CREATE new promotion
exports.createPromotion = async (req, res) => {
  try {
    const mainImagePath = req.files?.image?.[0]
      ? `/uploads/${req.files.image[0].filename}`
      : '';
    const galleryImages = req.files?.images
      ? req.files.images.map(f => `/uploads/${f.filename}`)
      : [];

    const promotion = new Promotion({
      ...req.body,
      image: mainImagePath,
      images: galleryImages,
      isActive: req.body.isActive !== 'false' // default to true
    });

    await promotion.save();
    res.json({ data: formatPromotion(req, promotion) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) return res.status(404).json({ error: 'Not found' });

    // ✅ ONLY update if new files uploaded
    if (req.files?.image?.[0]) {
      promotion.image = `/uploads/${req.files.image[0].filename}`;
    }
    if (req.files?.images?.length > 0) {
      promotion.images = req.files.images.map(f => `/uploads/${f.filename}`);
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'image' && key !== 'images') {
        promotion[key] = req.body[key];
      }
    });

    await promotion.save();
    res.json({ data: formatPromotion(req, promotion) });
  } catch (err) {
    console.error('Update promotion error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE promotion
exports.deletePromotion = async (req, res) => {
  try {
    const deleted = await Promotion.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });

    res.json({ message: 'Promotion deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
