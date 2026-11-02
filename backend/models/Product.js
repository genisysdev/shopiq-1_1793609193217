const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5, validate: { validator: Number.isInteger, message: 'Rating must be an integer' } },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  slug:          { type: String, required: true, unique: true, lowercase: true },
  description:   { type: String, required: true },
  price:         { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0, default: null },
  discount:      { type: Number, default: 0, min: 0, max: 100 },
  category:      { type: String, required: true, enum: ['Electronics', 'Fashion', 'Home & Kitchen', 'Sports', 'Books', 'Beauty', 'Toys'] },
  brand:         { type: String, required: true },
  images:        [{ url: { type: String, required: true }, alt: { type: String, default: '' } }],
  countInStock:  { type: Number, required: true, default: 0, min: 0, validate: { validator: Number.isInteger, message: 'Stock must be an integer' } },
  sku:           { type: String, sparse: true },
  tags:          [{ type: String }],
  specs:         { type: Map, of: String },
  reviews:       [reviewSchema],
  rating:        { type: Number, default: 0, min: 0, max: 5 },
  numReviews:    { type: Number, default: 0, min: 0, validate: { validator: Number.isInteger, message: 'numReviews must be an integer' } },
  numSold:       { type: Number, default: 0, min: 0, validate: { validator: Number.isInteger, message: 'numSold must be an integer' } },
  badge:         { type: String, default: '' },
  isFeatured:    { type: Boolean, default: false },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1 });

productSchema.pre('save', function (next) {
  if (this.originalPrice && this.originalPrice > this.price)
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  next();
});

module.exports = mongoose.model('Product', productSchema);