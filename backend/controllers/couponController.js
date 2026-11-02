const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

const applyCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;
  const coupon = await Coupon.findOne({ code:code.toUpperCase(), isActive:true, expiresAt:{$gt:new Date()} });
  if (!coupon) { res.status(400); throw new Error('Invalid or expired coupon'); }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) { res.status(400); throw new Error('Usage limit reached'); }
  if (req.user && coupon.redeemedBy.map(String).includes(req.user._id.toString())) { res.status(400); throw new Error('Already used this coupon'); }
  if (cartTotal < coupon.minOrderAmount) { res.status(400); throw new Error(`Minimum order ₹${coupon.minOrderAmount.toLocaleString('en-IN')} required`); }
  let discountAmount = coupon.type === 'percentage'
    ? Math.min(parseFloat(((cartTotal*coupon.value)/100).toFixed(2)), coupon.maxDiscountAmount || Infinity)
    : Math.min(coupon.value, cartTotal);
  res.json({ code:coupon.code, description:coupon.description, type:coupon.type, value:coupon.value, discountAmount });
});

const getCoupons    = asyncHandler(async (req, res) => { res.json(await Coupon.find().sort({createdAt:-1})); });
const createCoupon  = asyncHandler(async (req, res) => { res.status(201).json(await Coupon.create(req.body)); });
const toggleCoupon  = asyncHandler(async (req, res) => { const c = await Coupon.findById(req.params.id); if (!c) { res.status(404); throw new Error('Not found'); } c.isActive=!c.isActive; await c.save(); res.json(c); });
const deleteCoupon  = asyncHandler(async (req, res) => { await Coupon.findByIdAndDelete(req.params.id); res.json({message:'Deleted'}); });

module.exports = { applyCoupon, getCoupons, createCoupon, toggleCoupon, deleteCoupon };
