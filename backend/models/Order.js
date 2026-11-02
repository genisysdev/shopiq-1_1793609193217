const mongoose = require('mongoose');

const TRANSITIONS = {
  Pending:    ['Confirmed', 'Cancelled'],
  Confirmed:  ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped:    ['Delivered'],
  Delivered:  [],
  Cancelled:  [],
  Refunded:   [],
};

const orderSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name:     { type: String, required: true },
    image:    { type: String, default: '' },
    price:    { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, validate: { validator: Number.isInteger, message: 'Quantity must be an integer' } },
  }],
  shippingAddress: {
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true, match: [/^\d{6}$/, 'Pincode must be 6 digits'] },
    country: { type: String, default: 'India' },
  },
  paymentMethod:  { type: String, required: true, enum: ['cod', 'upi', 'card', 'netbanking'] },
  couponCode:     { type: String, default: null },
  subtotal:       { type: Number, required: true, min: 0 },
  shippingPrice:  { type: Number, required: true, min: 0 },
  taxPrice:       { type: Number, required: true, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  totalPrice:     { type: Number, required: true, min: 0 },
  orderStatus:    { type: String, enum: Object.keys(TRANSITIONS), default: 'Pending' },
  paymentStatus:  { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
  trackingNumber: { type: String, default: null },
  paidAt:         { type: Date, default: null },
  deliveredAt:    { type: Date, default: null },
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.methods.canTransitionTo = function (s) {
  return (TRANSITIONS[this.orderStatus] || []).includes(s);
};

module.exports = mongoose.model('Order', orderSchema);
module.exports.TRANSITIONS = TRANSITIONS;