const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const Product = require('../models/Product');

const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Math.min(Number(req.query.limit) || 12, 50);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.brand) filter.brand = req.query.brand;
  if (req.query.isFeatured) filter.isFeatured = req.query.isFeatured === 'true';
  if (req.query.minPrice || req.query.maxPrice) { filter.price = {}; if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice); if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice); }
  if (req.query.minRating) filter.rating = { $gte: Number(req.query.minRating) };
  if (req.query.inStock === 'true') filter.countInStock = { $gt: 0 };
  if (req.query.search) filter.$text = { $search: req.query.search };
  const sortMap = { popular:{numSold:-1}, newest:{createdAt:-1}, price_asc:{price:1}, price_desc:{price:-1}, rating:{rating:-1}, discount:{discount:-1} };
  const sort = sortMap[req.query.sort] || { numSold:-1 };
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(pageSize*(page-1)).limit(pageSize)
      .select('name slug price originalPrice discount images rating numReviews countInStock category brand badge isFeatured numSold'),
    Product.countDocuments(filter),
  ]);
  res.json({ products, page, pages: Math.ceil(total/pageSize), total });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true });
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  let slug = slugify(req.body.name, { lower:true, strict:true });
  if (await Product.findOne({ slug })) slug = `${slug}-${Date.now()}`;
  const product = await Product.create({ ...req.body, slug });
  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  if (req.body.name) req.body.slug = slugify(req.body.name, { lower:true, strict:true });
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true });
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive:false }, { new:true });
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ message: 'Product removed' });
});

const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  if (product.reviews.some(r => r.user.toString() === req.user._id.toString())) { res.status(400); throw new Error('Already reviewed'); }
  product.reviews.push({ user:req.user._id, name:req.user.name, rating:Number(rating), comment });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((s,r)=>s+r.rating,0) / product.reviews.length;
  await product.save();
  res.status(201).json({ message: 'Review added' });
});

const getCategories = asyncHandler(async (req, res) => {
  const cats = await Product.aggregate([{ $match:{isActive:true} },{ $group:{_id:'$category',count:{$sum:1}} },{ $sort:{count:-1} }]);
  res.json(cats);
});

module.exports = { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, addReview, getCategories };
