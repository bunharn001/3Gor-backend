const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  price: { type: Number },
  originalPrice: { type: Number },
  features: [{ type: String }],
  detailedFeatures: [{ type: String }],
  dimensions: { type: String },
  material: { type: String },
  warranty: { type: String },
  installation: { type: String },
  image: { type: String },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);
