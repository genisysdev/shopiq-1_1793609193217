const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const getStats = asyncHandler(async (req, res) => {
  const [totalOrders, totalUsers, totalProducts, revenueAgg, recentOrders] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments({ isActive: true }),
    Order.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email').select('totalPrice orderStatus paymentStatus createdAt user items'),
  ]);
  res.json({ totalOrders, totalUsers, totalProducts, totalRevenue: revenueAgg[0]?.total || 0, recentOrders });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const pageSize = 20, page = Number(req.query.page) || 1;
  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(pageSize * (page - 1)).limit(pageSize),
    Order.countDocuments(filter),
  ]);
  res.json({ orders, page, pages: Math.ceil(total / pageSize), total });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (!order.canTransitionTo(status)) { res.status(400); throw new Error(`Cannot go from ${order.orderStatus} to ${status}`); }
  order.orderStatus = status;
  if (status === 'Delivered') order.deliveredAt = new Date();
  if (trackingNumber) order.trackingNumber = trackingNumber;
  await order.save();
  res.json(order);
});

const getAllUsers = asyncHandler(async (req, res) => { res.json(await User.find().select('-password').sort({ createdAt: -1 })); });
const toggleUser = asyncHandler(async (req, res) => { const u = await User.findById(req.params.id); if (!u) { res.status(404); throw new Error('Not found'); } if (u.role === 'admin') { res.status(400); throw new Error('Cannot deactivate admin'); } u.isActive = !u.isActive; await u.save(); res.json({ _id: u._id, isActive: u.isActive }); });

module.exports = { getStats, getAllOrders, updateOrderStatus, getAllUsers, toggleUser };
