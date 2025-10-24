// controllers/productController.js - FIXED to use Cloudinary URLs
const Product = require('../models/Product');

// Helper function to format product data with full URLs
const formatProduct = (req, product) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return {
    ...product.toObject(),
    image: product.image ? (product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`) : null,
    images: product.images ? product.images.map(img => 
      img.startsWith('http') ? img : `${baseUrl}${img}`
    ) : []
  };
};

// GET all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    const formattedProducts = products.map(product => formatProduct(req, product));
    res.json(formattedProducts);
  } catch (err) {
    console.error('❌ Get products error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ data: formatProduct(req, product) });
  } catch (err) {
    console.error('❌ Get product error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category }).sort({ createdAt: -1 });
    const formattedProducts = products.map(product => formatProduct(req, product));
    res.json(formattedProducts);
  } catch (err) {
    console.error('❌ Get products by category error:', err);
    res.status(500).json({ error: err.message });
  }
};

// CREATE product
exports.createProduct = async (req, res) => {
  try {
    console.log('📥 Creating product with data:', req.body);
    console.log('📎 Files received:', {
      image: req.files?.image?.length || 0,
      images: req.files?.images?.length || 0
    });

    const productData = { ...req.body };

    // ✅ FIXED: Use full Cloudinary URLs from req.files[].path
    if (req.files?.image?.[0]) {
      productData.image = req.files.image[0].path;
      console.log('🖼️ Added image:', productData.image);
    }
    
    if (req.files?.images?.length > 0) {
      productData.images = req.files.images.map(f => f.path);
      console.log('🖼️ Added images:', productData.images);
    }

    // Handle JSON strings for arrays (features, detailedFeatures, specifications)
    ['features', 'detailedFeatures', 'specifications'].forEach(field => {
      if (productData[field] && typeof productData[field] === 'string') {
        try {
          productData[field] = JSON.parse(productData[field]);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
    });

    // Handle other fields
    Object.keys(productData).forEach(key => {
      let value = productData[key];
      
      // Handle boolean strings
      if (value === 'true') productData[key] = true;
      if (value === 'false') productData[key] = false;
      
      // Handle numeric strings
      if (key === 'price' && typeof value === 'string') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) productData[key] = numValue;
      }
    });

    const product = new Product(productData);
    await product.save();

    console.log('✅ Created product:', product._id);
    res.status(201).json({ data: formatProduct(req, product) });
  } catch (err) {
    console.error('❌ Create product error:', err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('🔄 Updating product:', req.params.id);
    console.log('📥 Request body:', req.body);
    console.log('📎 Files received:', {
      image: req.files?.image?.length || 0,
      images: req.files?.images?.length || 0
    });
    console.log('🖼️ Current images:', {
      currentImage: product.image,
      currentImages: product.images
    });

    // ✅ FIXED: Use full Cloudinary URLs from req.files[].path
    if (req.files?.image?.[0]) {
      const oldImage = product.image;
      product.image = req.files.image[0].path;
      console.log(`🖼️ Updated single image: ${oldImage} → ${product.image}`);
    } else {
      console.log('🖼️ Keeping existing single image:', product.image);
    }
    
    if (req.files?.images?.length > 0) {
      const oldImages = product.images;
      product.images = req.files.images.map(f => f.path);
      console.log(`🖼️ Updated multiple images: ${oldImages?.length || 0} → ${product.images.length}`);
    } else {
      console.log('🖼️ Keeping existing multiple images:', product.images?.length || 0, 'images');
    }

    // Update other fields (excluding image/images which we handled above)
    Object.keys(req.body).forEach(key => {
      if (key !== 'image' && key !== 'images') {
        let value = req.body[key];
        
        // Handle JSON strings for arrays
        if (['features', 'detailedFeatures', 'specifications'].includes(key) && 
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
        
        // Handle numeric strings for price
        if (key === 'price' && typeof value === 'string') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) value = numValue;
        }
        
        product[key] = value;
        console.log(`📝 Updated field ${key}:`, value);
      }
    });

    await product.save();
    
    console.log(`✅ Successfully updated product ${req.params.id}`);
    console.log('🖼️ Final images:', {
      finalImage: product.image,
      finalImages: product.images
    });

    res.json({ data: formatProduct(req, product) });
  } catch (err) {
    console.error('❌ Update product error:', err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('🗑️ Deleted product:', req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('❌ Delete product error:', err);
    res.status(500).json({ error: err.message });
  }
};