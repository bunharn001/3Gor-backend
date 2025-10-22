const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: false,
      default: 'residential',
      enum: ['residential', 'commercial', 'office'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    location: {
      type: String,
      default: '',
    },
    area: {
      type: String,
      default: '',
    },
    year: {
      type: String,
      default: new Date().getFullYear().toString(),
    },
    description: {
      type: String,
      default: '',
    },
    features: {
      type: [String],
      default: [],
    },
    materials: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
