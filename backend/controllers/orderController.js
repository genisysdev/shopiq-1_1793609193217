const { track } = require('../services/eventService');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const calcPrices = require('../utils/calcPrices');

const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode } = req.body;
  if (!items?.length) { res.status(400); throw new Error('No items provided'); }

  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ code:couponCode.toUpperCase(), isActive:true, expiresAt:{$gt:new Date()} });
    if (!coupon) { res.status(400); throw new Error('Invalid or expired coupon'); }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) { res.status(400); throw new Error('Coupon usage limit reached'); }
    if (coupon.redeemedBy.map(String).includes(req.user._id.toString())) { res.status(400); throw new Error('Coupon already used'); }
  }

  // Fetch DB prices (never trust client)
  const enriched = [];
  for (const item of items) {
    const p = await Product.findById(item.product).select('name price countInStock images isActive');
    if (!p?.isActive) { res.status(400); throw new Error(`Product ${item.product} unavailable`); }
    if (p.countInStock < item.quantity) { res.status(400); throw new Error(`Insufficient stock for "${p.name}"`); }
    enriched.push({ product:p._id, name:p.name, image:p.images[0]?.url||'', price:p.price, quantity:item.quantity });
  }

  const totals = calcPrices(enriched, coupon);
  if (coupon && totals.subtotal < coupon.minOrderAmount) { res.status(400); throw new Error(`Minimum order ₹${coupon.minOrderAmount} required`); }

  // Atomic: decrement stock + create order
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      for (const item of enriched) {
        const r = await Product.findOneAndUpdate({ _id:item.product, countInStock:{$gte:item.quantity} }, { $inc:{countInStock:-item.quantity, numSold:item.quantity} }, { session });
        if (!r) throw new Error(`Stock unavailable for "${item.name}"`);
      }
      const [created] = await Order.create([{ user:req.user._id, items:enriched, shippingAddress, paymentMethod, couponCode:couponCode?.toUpperCase()||null, ...totals }], { session });
      order = created;
      if (coupon) await Coupon.findByIdAndUpdate(coupon._id, { $inc:{usedCount:1}, $addToSet:{redeemedBy:req.user._id} }, { session });
      await Cart.findOneAndDelete({ user:req.user._id }, { session });
    });
  } finally { await session.endSession(); }

  res.status(201).json(order);
  track(req, 'order_placed', { orderId: order._id, orderTotal: order.totalPrice, quantity: enriched.length });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user:req.user._id }).sort({ createdAt:-1 });
  res.json(orders);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user','name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  res.json(order);
});

module.exports = { createOrder, getMyOrders, getOrderById };