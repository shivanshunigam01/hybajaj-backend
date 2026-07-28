const mongoose = require('mongoose');
const { PRODUCT_CATEGORIES } = require('../config/constants');

const variantSchema = new mongoose.Schema(
  { name: String, price: Number, sku: String },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tag: String,
    tagline: String,
    description: String,
    exShowroomPrice: { type: Number, required: true, min: 0 },
    emiFrom: { type: Number, min: 0 },
    variants: [variantSchema],
    colors: [String],
    specs: { type: mongoose.Schema.Types.Mixed },
    imageUrls: [String],
    brochureUrl: String,
    inventoryCount: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    seoTitle: String,
    seoDescription: String,
    isFeatured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, status: 1 });
productSchema.index({ isDeleted: 1, status: 1, isFeatured: -1, name: 1 });
productSchema.index({ isDeleted: 1, status: 1, category: 1 });

module.exports = mongoose.model('Product', productSchema);
