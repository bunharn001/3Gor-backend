const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: false, // ✅ no longer required
      default: 'kitchen', // ✅ fallback for missing category
      enum: ['kitchen', 'closet', 'tv-wall'], // ✅ Changed 'wardrobe' to 'closet'
    },
    price: {
      type: Number,
      required: false,
      default: 0,
    },
    originalPrice: {
      type: Number,
      required: false,
      default: 0,
    },
    badge: {
      type: String,
      default: '',
    },
    features: {
      type: [String],
      default: [],
    },
    fullDescription: {
      type: String,
      default: '',
    },
    specifications: {
      type: [
        {
          label: String,
          value: String,
        },
      ],
      default: [],
    },
    image: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);