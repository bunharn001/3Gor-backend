// backend/controllers/portfolioController.js
const path = require("path");
const Portfolio = require("../models/Portfolio");

// Helper: format image URLs
const formatImageUrl = (req, filePath) => {
  if (!filePath) return "";
  // ensure consistent path (no double slashes)
  return `${req.protocol}://${req.get("host")}/${filePath.replace(/^\/+/, "")}`;
};

// ================================
// 📸 GET ALL PORTFOLIOS
// ================================
const getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find().sort({ createdAt: -1 });

    const formatted = portfolios.map((p) => ({
      ...p._doc,
      images: p.images?.map((img) => formatImageUrl(req, img)) || [],
    }));

    res.json({ data: formatted });
  } catch (error) {
    console.error("Get all portfolios error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ================================
// 📸 GET PORTFOLIOS BY CATEGORY
// ================================
const getPortfoliosByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const portfolios = await Portfolio.find({ category }).sort({ createdAt: -1 });

    const formatted = portfolios.map((p) => ({
      ...p._doc,
      images: p.images?.map((img) => formatImageUrl(req, img)) || [],
    }));

    res.json({ data: formatted });
  } catch (error) {
    console.error("Get portfolios by category error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ================================
// 📸 CREATE PORTFOLIO
// ================================
const createPortfolio = async (req, res) => {
  try {
    // 🖼️ handle uploads
    const gallery = req.files?.images
      ? req.files.images.map((f) => path.join("uploads", f.filename))
      : [];

    const body = { ...req.body, images: gallery };

    // 🧠 convert comma-separated fields
    ["features", "materials"].forEach((field) => {
      if (typeof body[field] === "string") {
        body[field] = body[field]
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
      }
    });

    const portfolio = await Portfolio.create(body);
    res.status(201).json({
      success: true,
      data: {
        ...portfolio._doc,
        images: gallery.map((img) => formatImageUrl(req, img)),
      },
    });
  } catch (error) {
    console.error("Create portfolio error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ================================
// 📸 UPDATE PORTFOLIO - FIXED VERSION
// ================================
const updatePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) return res.status(404).json({ error: "Not found" });

    // ✅ Keep existing images by default
    let gallery = portfolio.images || [];

    // ✅ ONLY update if new files uploaded
    if (req.files?.images && req.files.images.length > 0) {
      gallery = req.files.images.map((f) => path.join("uploads", f.filename));
    }

    // ✅ Parse array fields properly
    let features = portfolio.features || [];
    let materials = portfolio.materials || [];

    if (req.body.features) {
      if (typeof req.body.features === "string") {
        try {
          features = JSON.parse(req.body.features);
        } catch {
          features = req.body.features.split(",").map((v) => v.trim()).filter(Boolean);
        }
      } else if (Array.isArray(req.body.features)) {
        features = req.body.features;
      }
    }

    if (req.body.materials) {
      if (typeof req.body.materials === "string") {
        try {
          materials = JSON.parse(req.body.materials);
        } catch {
          materials = req.body.materials.split(",").map((v) => v.trim()).filter(Boolean);
        }
      } else if (Array.isArray(req.body.materials)) {
        materials = req.body.materials;
      }
    }

    // ✅ Update portfolio
    Object.assign(portfolio, {
      ...req.body,
      images: gallery,
      features: features,
      materials: materials,
    });

    await portfolio.save();

    console.log(`✅ Updated portfolio ${req.params.id}:`, {
      imagesCount: gallery.length,
      featuresCount: features.length,
      materialsCount: materials.length
    });

    res.json({
      success: true,
      data: {
        ...portfolio._doc,
        images: gallery.map((img) => formatImageUrl(req, img)),
      },
    });
  } catch (error) {
    console.error("❌ Update portfolio error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ================================
// 🗑️ DELETE PORTFOLIO
// ================================
const deletePortfolio = async (req, res) => {
  try {
    const deleted = await Portfolio.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete portfolio error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllPortfolios,
  getPortfoliosByCategory,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
};
