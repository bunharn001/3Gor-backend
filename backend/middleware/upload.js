// ✅ UPDATE promotion - FIXED VERSION
exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) return res.status(404).json({ error: 'Not found' });

    // ✅ ONLY update image if new file uploaded
    if (req.files?.image?.[0]) {
      promotion.image = `/uploads/${req.files.image[0].filename}`;
    }
    
    // ✅ ONLY update images if new files uploaded
    if (req.files?.images?.length > 0) {
      promotion.images = req.files.images.map(f => `/uploads/${f.filename}`);
    }

    // ✅ Update other fields (excluding image/images which we handled above)
    Object.keys(req.body).forEach(key => {
      if (key !== 'image' && key !== 'images') {
        promotion[key] = req.body[key];
      }
    });

    await promotion.save();
    
    console.log(`✅ Updated promotion ${req.params.id}:`, {
      hasImage: !!promotion.image,
      imagesCount: promotion.images?.length || 0
    });

    res.json({ data: formatPromotion(req, promotion) });
  } catch (err) {
    console.error('❌ Update promotion error:', err);
    res.status(500).json({ error: err.message });
  }
};