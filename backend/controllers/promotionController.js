// controllers/promotionController.js - FIXED VERSION
const Promotion = require('../models/Promotion'); // Adjust path as needed

// Helper function to format promotion data with full URLs
const formatPromotion = (req, promotion) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return {
    ...promotion.toObject(),
    image: promotion.image ? (promotion.image.startsWith('http') ? promotion.image : `${baseUrl}${promotion.image}`) : null,
    images: promotion.images ? promotion.images.map(img => 
      img.startsWith('http') ? img : `${baseUrl}${img}`
    ) : []
  };
};

// ✅ GET all promotions
exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    const formattedPromotions = promotions.map(promotion => formatPromotion(req, promotion));
    res.json(formattedPromotions);
  } catch (err) {
    console.error('❌ Get promotions error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET promotion by ID
exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    res.json({ data: formatPromotion(req, promotion) });
  } catch (err) {
    console.error('❌ Get promotion error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ CREATE promotion
exports.createPromotion = async (req, res) => {
  try {
    console.log('📥 Creating promotion with data:', req.body);
    console.log('📎 Files received:', {
      image: req.files?.image?.length || 0,
      images: req.files?.images?.length || 0
    });

    const promotionData = { ...req.body };

    // Handle file uploads
    if (req.files?.image?.[0]) {
      promotionData.image = `/uploads/${req.files.image[0].filename}`;
      console.log('🖼️ Added image:', promotionData.image);
    }
    
    if (req.files?.images?.length > 0) {
      promotionData.images = req.files.images.map(f => `/uploads/${f.filename}`);
      console.log('🖼️ Added images:', promotionData.images);
    }

    // Handle JSON strings for arrays
    Object.keys(promotionData).forEach(key => {
      let value = promotionData[key];
      
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try {
          value = JSON.parse(value);
          promotionData[key] = value;
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
      
      // Handle boolean strings
      if (value === 'true') promotionData[key] = true;
      if (value === 'false') promotionData[key] = false;
    });

    const promotion = new Promotion(promotionData);
    await promotion.save();

    console.log('✅ Created promotion:', promotion._id);
    res.status(201).json({ data: formatPromotion(req, promotion) });
  } catch (err) {
    console.error('❌ Create promotion error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE promotion - THIS IS THE CRITICAL FIX
exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    console.log('🔄 Updating promotion:', req.params.id);
    console.log('📥 Request body:', req.body);
    console.log('📎 Files received:', {
      image: req.files?.image?.length || 0,
      images: req.files?.images?.length || 0
    });
    console.log('🖼️ Current images:', {
      currentImage: promotion.image,
      currentImages: promotion.images
    });

    // ✅ CRITICAL FIX: Only update image fields if new files are uploaded
    // This preserves existing images when no new files are selected
    if (req.files?.image?.[0]) {
      const oldImage = promotion.image;
      promotion.image = `/uploads/${req.files.image[0].filename}`;
      console.log(`🖼️ Updated single image: ${oldImage} → ${promotion.image}`);
    } else {
      console.log('🖼️ Keeping existing single image:', promotion.image);
    }
    
    if (req.files?.images?.length > 0) {
      const oldImages = promotion.images;
      promotion.images = req.files.images.map(f => `/uploads/${f.filename}`);
      console.log(`🖼️ Updated multiple images: ${oldImages?.length || 0} → ${promotion.images.length}`);
    } else {
      console.log('🖼️ Keeping existing multiple images:', promotion.images?.length || 0, 'images');
    }

    // ✅ Update other fields (excluding image/images which we handled above)
    Object.keys(req.body).forEach(key => {
      if (key !== 'image' && key !== 'images') {
        let value = req.body[key];
        
        // Handle JSON strings for arrays
        if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            // If parsing fails, keep as string
          }
        }
        
        // Handle boolean strings
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        
        promotion[key] = value;
        console.log(`📝 Updated field ${key}:`, value);
      }
    });

    await promotion.save();
    
    console.log(`✅ Successfully updated promotion ${req.params.id}`);
    console.log('🖼️ Final images:', {
      finalImage: promotion.image,
      finalImages: promotion.images
    });

    res.json({ data: formatPromotion(req, promotion) });
  } catch (err) {
    console.error('❌ Update promotion error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE promotion
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    console.log('🗑️ Deleted promotion:', req.params.id);
    res.json({ message: 'Promotion deleted successfully' });
  } catch (err) {
    console.error('❌ Delete promotion error:', err);
    res.status(500).json({ error: err.message });
  }
};