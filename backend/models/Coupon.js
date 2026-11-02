const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:              { type: String, required: true, unique: true, uppercase: true, trim: true },
  description:       { type: String, default: '' },
  type:              { type: String, enum: ['percentage', 'fixed'], required: true },
  value:             { type: Number, required: true, min: 1 },
  minOrderAmount:    { type: Number, default: 0, min: 0 },
  maxDiscountAmount: { type: Number, default: null, min: 0 },
  usageLimit:        { type: Number, default: null, min: 1 },
  usedCount:         { type: Number, default: 0, min: 0, validate: { validator: Number.isInteger, message: 'usedCount must be an integer' } },
  perUserLimit:      { type: Number, default: 1, min: 1 },
  redeemedBy:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive:          { type: Boolean, default: true },
  expiresAt:         { type: Date, required: true },
}, { timestamps: true });

// Percentage coupons must not exceed 100
couponSchema.pre('save', function (next) {
  if (this.type === 'percentage' && this.value > 100)
    return next(new Error('Percentage coupon value cannot exceed 100'));
  next();
});

module.exports = mongoose.model('Coupon', couponSchema);