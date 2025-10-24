// controllers/portfolioController.js - FIXED VERSION
const Portfolio = require('../models/Portfolio'); // Adjust path as needed

// Helper function to format portfolio data with full URLs
const formatPortfolio = (req, portfolio) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return {
    ...portfolio.toObject(),
    image: portfolio.image ? (portfolio.image.startsWith('http') ? portfolio.image : `${baseUrl}${portfolio.image}`) : null,
    images: portfolio.images ? portfolio.images.map(img => 
      img.startsWith('http') ? img : `${baseUrl}${img}`
    ) : []
  };
};

// ✅ GET all portfolios
exports.getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find().sort({ createdAt: -1 });
    const formattedPortfolios = portfolios.map(portfolio => formatPortfolio(req, portfolio));
    res.json(formattedPortfolios);
  } catch (err) {
    console.error('❌ Get portfolios error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET portfolio by ID
exports.getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    res.json({ data: formatPortfolio(req, portfolio) });
  } catch (err) {
    console.error('❌ Get portfolio error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET portfolios by category
exports.getPortfoliosByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const portfolios = await Portfolio.find({ category }).sort({ createdAt: -1 });
    const formattedPortfolios = portfolios.map(portfolio => formatPortfolio(req, portfolio));
    res.json(formattedPortfolios);
  } catch (err) {
    console.error('❌ Get portfolios by category error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ CREATE portfolio
exports.createPortfolio = async (req, res) => {
  try {
    console.log('📥 Creating portfolio with data:', req.body);
    console.log('📎 Files received:', {
      image: req.files?.image?.length || 0,
      images: req.files?.images?.length || 0
    });

    const portfolioData = { ...req.body };

    // Handle file uploads
    if (req.files?.image?.[0]) {
      portfolioData.image = `/uploads/${req.files.image[0].filename}`;
      console.log('🖼️ Added image:', portfolioData.image);
    }
    
    if (req.files?.images?.length > 0) {
      portfolioData.images = req.files.images.map(f => `/uploads/${f.filename}`);
      console.log('🖼️ Added images:', portfolioData.images);
    }

    // Handle JSON strings for arrays (features, materials)
    ['features', 'materials'].forEach(field => {
      if (portfolioData[field] && typeof portfolioData[field] === 'string') {
        try {
          portfolioData[field] = JSON.parse(portfolioData[field]);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
    });

    // Handle other fields
    Object.keys(portfolioData).forEach(key => {
      let value = portfolioData[key];
      
      // Handle boolean strings
      if (value === 'true') portfolioData[key] = true;
      if (value === 'false') portfolioData[key] = false;
      
      // Handle numeric strings for year
      if (key === 'year' && typeof value === 'string') {
        const numValue = parseInt(value);
        if (!isNaN(numValue)) portfolioData[key] = numValue;
      }
    });

    const portfolio = new Portfolio(portfolioData);
    await portfolio.save();

    console.log('✅ Created portfolio:', portfolio._id);
    res.status(201).json({ data: formatPortfolio(req, portfolio) });
  } catch (err) {
    console.error('❌ Create portfolio error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE portfolio - CRITICAL FIX
exports.updatePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    console.log('🔄 Updating portfolio:', req.params.id);
    console.log('📥 Request body:', req.body);
    console.log('📎 Files received:', {
      image: req.files?.image?.length || 0,
      images: req.files?.images?.length || 0
    });
    console.log('🖼️ Current images:', {
      currentImage: portfolio.image,
      currentImages: portfolio.images
    });

    // ✅ CRITICAL FIX: Only update image fields if new files are uploaded
    if (req.files?.image?.[0]) {
      const oldImage = portfolio.image;
      portfolio.image = `/uploads/${req.files.image[0].filename}`;
      console.log(`🖼️ Updated single image: ${oldImage} → ${portfolio.image}`);
    } else {
      console.log('🖼️ Keeping existing single image:', portfolio.image);
    }
    
    if (req.files?.images?.length > 0) {
      const oldImages = portfolio.images;
      portfolio.images = req.files.images.map(f => `/uploads/${f.filename}`);
      console.log(`🖼️ Updated multiple images: ${oldImages?.length || 0} → ${portfolio.images.length}`);
    } else {
      console.log('🖼️ Keeping existing multiple images:', portfolio.images?.length || 0, 'images');
    }

    // ✅ Update other fields (excluding image/images which we handled above)
    Object.keys(req.body).forEach(key => {
      if (key !== 'image' && key !== 'images') {
        let value = req.body[key];
        
        // Handle JSON strings for arrays
        if (['features', 'materials'].includes(key) && 
            typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            // If parsing fails, keep as string
          }
        }
        
        // Handle boolean strings
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        
        // Handle numeric strings for year
        if (key === 'year' && typeof value === 'string') {
          const numValue = parseInt(value);
          if (!isNaN(numValue)) value = numValue;
        }
        
        portfolio[key] = value;
        console.log(`📝 Updated field ${key}:`, value);
      }
    });

    await portfolio.save();
    
    console.log(`✅ Successfully updated portfolio ${req.params.id}`);
    console.log('🖼️ Final images:', {
      finalImage: portfolio.image,
      finalImages: portfolio.images
    });

    res.json({ data: formatPortfolio(req, portfolio) });
  } catch (err) {
    console.error('❌ Update portfolio error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE portfolio
exports.deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findByIdAndDelete(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    
    console.log('🗑️ Deleted portfolio:', req.params.id);
    res.json({ message: 'Portfolio deleted successfully' });
  } catch (err) {
    console.error('❌ Delete portfolio error:', err);
    res.status(500).json({ error: err.message });
  }
};