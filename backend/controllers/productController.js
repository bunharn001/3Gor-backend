// backend/controllers/productController.js
const path = require("path");

let Product;
try {
  Product = require("../models/Product");
} catch (err) {
  try {
    Product = require("../models/productModel");
  } catch (err2) {
    try {
      Product = require("../models/Product");
    } catch (err3) {
      console.error("❌ Cannot find Product model:", err3.message);
    }
  }
}

// ================================
// 📦 GET ALL PRODUCTS
// ================================
const getAllProducts = async (req, res) => {
  try {
    if (!Product) {
      return res.status(500).json({
        success: false,
        message: "Product model not found.",
      });
    }

    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ================================
// 📦 GET SINGLE PRODUCT
// ================================
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ================================
// 📦 CREATE PRODUCT (with image uploads)
// ================================
const createProduct = async (req, res) => {
  try {
    if (!Product)
      return res.status(500).json({ success: false, message: "Product model not found" });

    // 🖼️ Handle uploaded images
    let mainImage = "";
    let galleryImages = [];

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        mainImage = path.join("uploads", req.files.image[0].filename);
      }
      if (req.files.images && req.files.images.length > 0) {
        galleryImages = req.files.images.map((file) => path.join("uploads", file.filename));
      }
    }

    const productData = {
      ...req.body,
      image: mainImage,
      images: galleryImages,
      features: req.body.features
        ? Array.isArray(req.body.features)
          ? req.body.features
          : req.body.features.split(",").map((f) => f.trim())
        : [],
      specifications: req.body.specifications
        ? typeof req.body.specifications === "string"
          ? JSON.parse(req.body.specifications)
          : req.body.specifications
        : [],
    };

    const product = await Product.create(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("❌ Create product error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ================================
// 📦 UPDATE PRODUCT - FIXED VERSION
// ================================
const updateProduct = async (req, res) => {
  try {
    if (!Product)
      return res.status(500).json({ success: false, message: "Product model not found" });

    const existing = await Product.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ success: false, message: "Product not found" });

    // ✅ Keep existing images by default
    let mainImage = existing.image;
    let galleryImages = existing.images || [];

    // ✅ ONLY update if new files uploaded
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        mainImage = path.join("uploads", req.files.image[0].filename);
      }
      if (req.files.images && req.files.images.length > 0) {
        galleryImages = req.files.images.map((file) => path.join("uploads", file.filename));
      }
    }

    // ✅ Parse features and specifications properly
    let features = existing.features || [];
    if (req.body.features) {
      if (typeof req.body.features === 'string') {
        try {
          // Try parsing as JSON first
          features = JSON.parse(req.body.features);
        } catch {
          // If not JSON, split by comma
          features = req.body.features.split(",").map((f) => f.trim()).filter(Boolean);
        }
      } else if (Array.isArray(req.body.features)) {
        features = req.body.features;
      }
    }

    let specifications = existing.specifications || [];
    if (req.body.specifications) {
      if (typeof req.body.specifications === "string") {
        try {
          specifications = JSON.parse(req.body.specifications);
        } catch (e) {
          console.error("Failed to parse specifications:", e);
        }
      } else {
        specifications = req.body.specifications;
      }
    }

    const updatedData = {
      ...req.body,
      image: mainImage,
      images: galleryImages,
      features: features,
      specifications: specifications,
    };

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });

    console.log(`✅ Updated product ${req.params.id}:`, {
      hasImage: !!updatedProduct.image,
      imagesCount: updatedProduct.images?.length || 0,
      featuresCount: updatedProduct.features?.length || 0
    });

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("❌ Update product error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ================================
// 📦 DELETE PRODUCT
// ================================
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ================================
// 📦 GET PRODUCTS BY CATEGORY
// ================================
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category }).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
};
