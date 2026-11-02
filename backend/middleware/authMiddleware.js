const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) { res.status(401); throw new Error('No token provided'); }
  const token = auth.split(' ')[1];
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id).select('-password');
    if (!req.user?.isActive) { res.status(401); throw new Error('User inactive or not found'); }
    next();
  } catch { res.status(401); throw new Error('Invalid token'); }
});

const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403); throw new Error('Admin access required');
};

module.exports = { protect, adminOnly };
