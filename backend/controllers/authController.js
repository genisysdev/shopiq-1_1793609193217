const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { track } = require('../services/eventService');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) { res.status(409); throw new Error('Email already registered'); }
  const user = await User.create({ name, email, password });
  const payload = { _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) };
  res.status(201).json(payload);
  // Track after response sent
  track({ ...req, user }, 'register', { page: '/register' });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) { res.status(401); throw new Error('Invalid email or password'); }
  if (!user.isActive) { res.status(403); throw new Error('Account deactivated'); }
  const payload = { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, wishlist: user.wishlist, token: generateToken(user._id) };
  res.json(payload);
  track({ ...req, user }, 'login', { page: '/login' });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price images slug');
  res.json(user);
});

// PUT /api/auth/me
const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, phone, address, password } = req.body;
  if (name)     user.name = name;
  if (phone)    user.phone = phone;
  if (address)  user.address = { ...user.address.toObject?.() || user.address, ...address };
  if (password) user.password = password;
  const updated = await user.save();
  res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role, phone: updated.phone, address: updated.address });
});

// PUT /api/auth/wishlist/:productId
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const pid = req.params.productId;
  const idx = user.wishlist.map(String).indexOf(pid);
  const action = idx > -1 ? 'wishlist_remove' : 'wishlist_add';
  if (idx > -1) user.wishlist.splice(idx, 1);
  else user.wishlist.push(pid);
  await user.save();
  res.json({ wishlist: user.wishlist });
  track(req, action, { productId: pid });
});

module.exports = { register, login, getMe, updateMe, toggleWishlist };