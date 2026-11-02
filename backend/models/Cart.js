const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
  sessionId: { type: String, sparse: true },
  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, validate: { validator: Number.isInteger, message: 'Quantity must be an integer' } },
    price:    { type: Number, required: true, min: 0 },
  }],
  couponCode:     { type: String, default: null },
  discountAmount: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);