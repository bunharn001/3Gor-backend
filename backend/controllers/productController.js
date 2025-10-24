const path = require("path");
const Product = require("../models/Product");

// ================================
// 📦 GET ALL PRODUCTS
// ================================
const getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error("❌ Get all products error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================================
// 📦 GET SINGLE PRODUCT
// ================================
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("❌ Get product by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================================
// 📦 CREATE PRODUCT
// ================================
const createProduct = async (req, res) => {
  try {
    let mainImage = "";
    let galleryImages = [];

    if (req.files) {
      if (req.files.image && req.files.image[0])
        mainImage = path.join("uploads", req.files.image[0].filename);
      if (req.files.images && req.files.images.length > 0)
        galleryImages = req.files.images.map((file) =>
          path.join("uploads", file.filename)
        );
    }

    // ✅ Parse features (plain text or JSON)
    let features = [];
    if (req.body.features) {
      const f = req.body.features;
      if (typeof f === "string") {
        try {
          features = JSON.parse(f);
        } catch {
          // support comma or newlines
          features = f.split(/\r?\n|,/).map((x) => x.trim()).filter(Boolean);
        }
      } else if (Array.isArray(f)) {
        features = f.map((x) => String(x).trim()).filter(Boolean);
      }
    }

    // ✅ Parse specifications (plain text, array, or JSON)
    let specifications = "";
    if (req.body.specifications) {
      const s = req.body.specifications;
      if (typeof s === "string") {
        try {
          // try JSON first
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) specifications = parsed.join("\n");
          else if (typeof parsed === "object")
            specifications = Object.values(parsed).join("\n");
          else specifications = String(parsed);
        } catch {
          // normal plain text
          specifications = s.trim();
        }
      } else if (Array.isArray(s)) {
        specifications = s.map((x) => String(x).trim()).join("\n");
      } else {
        specifications = String(s).trim();
      }
    }

    console.log("🧾 Parsed features for create:", features);
    console.log("🧾 Parsed specifications for create:", specifications);

    const product = await Product.create({
      ...req.body,
      image: mainImage,
      images: galleryImages,
      features,
      specifications, // ✅ always a string now
    });

    res.status(201).json({
      success: true,
      data: product,
      debug: { features, specifications },
    });
  } catch (error) {
    console.error("❌ Create product error:");
    console.error("Message:", error.message);
    console.error("Name:", error.name);
    console.error("Path:", error.path || "N/A");
    console.error("Value:", error.value || "N/A");
    console.error("Stack:", error.stack.split("\n").slice(0, 5).join("\n"));
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: {
        message: error.message,
        name: error.name,
        path: error.path,
        value: error.value,
      },
    });
  }
};

// ================================
// 📦 UPDATE PRODUCT
// ================================
const updateProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    let mainImage = existing.image;
    let galleryImages = existing.images || [];

    if (req.files) {
      if (req.files.image && req.files.image[0])
        mainImage = path.join("uploads", req.files.image[0].filename);
      if (req.files.images && req.files.images.length > 0)
        galleryImages = req.files.images.map((file) =>
          path.join("uploads", file.filename)
        );
    }

    // ✅ Features parsing
    let features = existing.features || [];
    if (req.body.features !== undefined) {
      const f = req.body.features;
      if (!f || f === "[]") features = [];
      else if (typeof f === "string") {
        try {
          features = JSON.parse(f);
        } catch {
          features = f.split(/\r?\n|,/).map((x) => x.trim()).filter(Boolean);
        }
      } else if (Array.isArray(f)) {
        features = f.map((x) => String(x).trim()).filter(Boolean);
      }
    }

    // ✅ Specifications parsing
    let specifications = existing.specifications || "";
    if (req.body.specifications !== undefined) {
      const s = req.body.specifications;
      if (!s || s === "[]") specifications = "";
      else if (typeof s === "string") {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) specifications = parsed.join("\n");
          else if (typeof parsed === "object")
            specifications = Object.values(parsed).join("\n");
          else specifications = String(parsed);
        } catch {
          specifications = s.trim();
        }
      } else if (Array.isArray(s)) {
        specifications = s.map((x) => String(x).trim()).join("\n");
      } else {
        specifications = String(s).trim();
      }
    }

    console.log("🧾 Parsed features for update:", features);
    console.log("🧾 Parsed specifications for update:", specifications);

    const updatedData = {
      ...req.body,
      image: mainImage,
      images: galleryImages,
      features,
      specifications, // ✅ always stored as plain string
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    console.log(`✅ Updated product ${req.params.id}`, {
      featuresCount: updatedProduct.features?.length || 0,
      specificationsType: typeof updatedProduct.specifications,
    });

    res.json({
      success: true,
      data: updatedProduct,
      debug: { features, specifications },
    });
  } catch (error) {
    console.error("❌ Update product error:");
    console.error("Message:", error.message);
    console.error("Name:", error.name);
    console.error("Kind:", error.kind || "N/A");
    console.error("Path:", error.path || "N/A");
    console.error("Value:", error.value || "N/A");
    console.error("Stack:", error.stack.split("\n").slice(0, 5).join("\n"));

    if (error.name === "ValidationError") {
      const fields = Object.keys(error.errors).map(
        (k) => `${k}: ${error.errors[k].message}`
      );
      console.error("⚠️ Validation Errors:", fields);
      return res
        .status(400)
        .json({ success: false, message: "Validation Error", errors: fields });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: {
        message: error.message,
        name: error.name,
        kind: error.kind,
        path: error.path,
        value: error.value,
      },
    });
  }
};

// ================================
// 📦 DELETE PRODUCT
// ================================
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
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
    console.error("❌ Get products by category error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
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
