const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const cartQuery = (req) => req.user ? { user: req.user._id } : { sessionId: req.headers['x-session-id'] };

const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne(cartQuery(req)).populate('items.product','name slug images price countInStock brand');
  res.json(cart || { items:[], couponCode:null, discountAmount:0 });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity=1 } = req.body;
  const product = await Product.findById(productId).select('price countInStock isActive name');
  if (!product?.isActive) { res.status(404); throw new Error('Product not found'); }
  if (product.countInStock < quantity) { res.status(400); throw new Error(`Only ${product.countInStock} units available`); }
  const query = cartQuery(req);
  let cart = await Cart.findOne(query) || new Cart({ ...query, items:[] });
  const existing = cart.items.find(i => i.product?.toString() === productId);
  if (existing) { const nq = existing.quantity + quantity; if (nq > product.countInStock) { res.status(400); throw new Error('Exceeds stock'); } existing.quantity = nq; existing.price = product.price; }
  else cart.items.push({ product:productId, quantity, price:product.price });
  await cart.save();
  res.status(201).json(await Cart.findById(cart._id).populate('items.product','name slug images price countInStock brand'));
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne(cartQuery(req));
  if (!cart) { res.status(404); throw new Error('Cart not found'); }
  const item = cart.items.find(i => i.product?.toString() === req.params.productId);
  if (!item) { res.status(404); throw new Error('Item not in cart'); }
  if (quantity <= 0) cart.items = cart.items.filter(i => i.product?.toString() !== req.params.productId);
  else { const p = await Product.findById(req.params.productId).select('countInStock'); if (quantity > p.countInStock) { res.status(400); throw new Error(`Only ${p.countInStock} available`); } item.quantity = quantity; }
  await cart.save();
  res.json(await Cart.findById(cart._id).populate('items.product','name slug images price countInStock brand'));
});

const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne(cartQuery(req));
  if (!cart) { res.status(404); throw new Error('Cart not found'); }
  cart.items = cart.items.filter(i => i.product?.toString() !== req.params.productId);
  await cart.save();
  res.json(await Cart.findById(cart._id).populate('items.product','name slug images price countInStock brand'));
});

const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete(cartQuery(req));
  res.json({ message:'Cart cleared' });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
