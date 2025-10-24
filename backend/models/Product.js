const mongoose = require('mongoose');

// ✅ Define schema
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
      default: 'kitchen',
      enum: ['kitchen', 'closet', 'tv-wall'],
    },
    price: {
      type: Number,
      default: 0,
    },
    originalPrice: {
      type: Number,
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
      type: String, // ✅ <-- key fix
      default: '',
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

// ✅ Force reload of the Product model to override any cached schema
delete mongoose.connection.models['Product'];
module.exports = mongoose.model('Product', productSchema);
