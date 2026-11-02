/**
 * ShopIQ Seed Script
 *   npm run seed          → insert all data
 *   npm run seed:destroy  → wipe all data
 */
require('dotenv').config();
const mongoose = require('mongoose');
const colors = require('colors');
const connectDB = require('../config/db');
const User    = require('../models/User');
const Product = require('../models/Product');
const Order   = require('../models/Order');
const Coupon  = require('../models/Coupon');
const Cart    = require('../models/Cart');

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const users = [
  { name:'Admin User',    email:'admin@shopiq.com',  password:'Admin@1234', role:'admin',    phone:'+91 9900000001', address:{street:'1 Tech Park',city:'Bengaluru',state:'Karnataka',pincode:'560001'} },
  { name:'Priya Sharma',  email:'priya@example.com', password:'User@1234',  role:'customer', phone:'+91 9876543210', address:{street:'42 MG Road',city:'Bengaluru',state:'Karnataka',pincode:'560001'} },
  { name:'Rahul Verma',   email:'rahul@example.com', password:'User@1234',  role:'customer', phone:'+91 9123456789', address:{street:'15 Park Street',city:'Mumbai',state:'Maharashtra',pincode:'400001'} },
];

const products = [
  {
    name:'iPhone 15 Pro Max', slug:'iphone-15-pro-max',
    description:'The most powerful iPhone ever. A17 Pro chip, titanium design, 48MP camera system, Action button and USB-C connectivity.',
    price:134900, originalPrice:149900, category:'Electronics', brand:'Apple',
    images:[{url:'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',alt:'iPhone 15 Pro Max'}],
    countInStock:45, sku:'APL-IP15PM-256', badge:'Best Seller', isFeatured:true, rating:4.8, numReviews:2847, numSold:15420,
    tags:['bestseller','featured'],
    specs: new Map([['Display','6.7" Super Retina XDR'],['Chip','A17 Pro'],['Camera','48MP Main + 12MP Ultra Wide'],['Battery','4422 mAh'],['Storage','256GB']]),
  },
  {
    name:'Samsung Galaxy S24 Ultra', slug:'samsung-galaxy-s24-ultra',
    description:'Built-in S Pen, 200MP camera, Snapdragon 8 Gen 3. The most powerful Galaxy with AI-powered features.',
    price:129999, originalPrice:139999, category:'Electronics', brand:'Samsung',
    images:[{url:'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80',alt:'Galaxy S24 Ultra'}],
    countInStock:32, sku:'SAM-S24U-512', badge:'New Arrival', isFeatured:true, rating:4.7, numReviews:1923, numSold:9870,
    tags:['featured','new'],
    specs: new Map([['Display','6.8" Dynamic AMOLED 2X'],['Chip','Snapdragon 8 Gen 3'],['Camera','200MP main'],['Battery','5000 mAh'],['S Pen','Built-in']]),
  },
  {
    name:'Sony WH-1000XM5 Headphones', slug:'sony-wh-1000xm5',
    description:'Industry-leading noise cancellation, 30-hour battery. Two processors and 8 microphones for AI noise cancellation.',
    price:24990, originalPrice:34990, category:'Electronics', brand:'Sony',
    images:[{url:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',alt:'Sony WH-1000XM5'}],
    countInStock:120, sku:'SONY-WH1000XM5', badge:'29% Off', isFeatured:false, rating:4.9, numReviews:5621, numSold:28900,
    tags:['bestseller','deal'],
    specs: new Map([['Type','Over-ear'],['Battery','30 hours'],['Bluetooth','5.2'],['Weight','250g'],['ANC','Industry Best']]),
  },
  {
    name:'MacBook Pro 14" M3 Pro', slug:'macbook-pro-14-m3-pro',
    description:'M3 Pro chip, 18-core GPU, up to 22 hours battery. Liquid Retina XDR display with ProMotion.',
    price:198900, originalPrice:219900, category:'Electronics', brand:'Apple',
    images:[{url:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',alt:'MacBook Pro 14'}],
    countInStock:18, sku:'APL-MBP14-M3P', badge:'Premium', isFeatured:true, rating:4.9, numReviews:1204, numSold:6780,
    tags:['featured','premium'],
    specs: new Map([['Chip','Apple M3 Pro'],['RAM','18GB'],['Storage','512GB SSD'],['Display','14.2" Liquid Retina XDR'],['Battery','22 hours']]),
  },
  {
    name:'Nike Air Jordan 1 Retro High OG', slug:'nike-air-jordan-1-retro',
    description:'Iconic Air Jordan 1 in classic colorway. Premium tumbled leather upper with Air-Sole cushioning.',
    price:10995, originalPrice:12995, category:'Fashion', brand:'Nike',
    images:[{url:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',alt:'Air Jordan 1'}],
    countInStock:0, sku:'NIKE-AJ1-RETRO', badge:'Out of Stock', isFeatured:false, rating:4.6, numReviews:3892, numSold:42100,
    tags:['bestseller'],
    specs: new Map([['Material','Premium Leather'],['Sole','Rubber'],['Closure','Lace-up'],['Style','High Top'],['Gender','Unisex']]),
  },
  {
    name:"Levi's 511 Slim Fit Jeans", slug:'levis-511-slim-fit-jeans',
    description:'Slim fit jeans that sit below the waist. Stretch denim for all-day comfort. The jean that started it all.',
    price:2999, originalPrice:4999, category:'Fashion', brand:"Levi's",
    images:[{url:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',alt:"Levi's 511"}],
    countInStock:350, sku:'LEVIS-511-32', badge:'40% Off', isFeatured:false, rating:4.4, numReviews:8910, numSold:67000,
    tags:['deal'],
    specs: new Map([['Fit','Slim'],['Rise','Mid Rise'],['Fabric','99% Cotton, 1% Elastane'],['Wash','Medium'],['Closure','Button fly']]),
  },
  {
    name:'Instant Pot Duo 7-in-1', slug:'instant-pot-duo-7-in-1',
    description:'7-in-1 programmable pressure cooker. Replace 7 appliances: pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, warmer.',
    price:7999, originalPrice:12999, category:'Home & Kitchen', brand:'Instant Pot',
    images:[{url:'https://images.unsplash.com/photo-1585515656285-6b4fdba44b95?w=600&q=80',alt:'Instant Pot'}],
    countInStock:200, sku:'IP-DUO-7IN1-6QT', badge:'38% Off', isFeatured:false, rating:4.7, numReviews:12450, numSold:89000,
    tags:['bestseller','deal'],
    specs: new Map([['Capacity','6 Quart'],['Functions','7-in-1'],['Programs','14 smart programs'],['Material','Stainless Steel'],['Power','1000W']]),
  },
  {
    name:'Dyson V15 Detect Cordless Vacuum', slug:'dyson-v15-detect',
    description:'Laser reveals invisible dust. Auto-adjusting suction, up to 60-minute battery, whole-machine HEPA filtration.',
    price:52900, originalPrice:62900, category:'Home & Kitchen', brand:'Dyson',
    images:[{url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',alt:'Dyson V15'}],
    countInStock:55, sku:'DYSON-V15', badge:'Top Rated', isFeatured:true, rating:4.8, numReviews:2341, numSold:11200,
    tags:['featured','premium'],
    specs: new Map([['Suction','230 AW'],['Battery','60 min'],['Filtration','HEPA'],['Weight','3.1 kg'],['Laser','Green laser detect']]),
  },
  {
    name:'Liforme Yoga Mat 6mm', slug:'liforme-yoga-mat-6mm',
    description:'Eco-friendly natural rubber with AlignForMe system. GripForce non-slip surface, exceptional grip even when wet.',
    price:3499, originalPrice:4999, category:'Sports', brand:'Liforme',
    images:[{url:'https://images.unsplash.com/photo-1601925228201-4b3b20af5f2e?w=600&q=80',alt:'Yoga Mat'}],
    countInStock:180, sku:'LIF-YOGAMAT-6MM', badge:'30% Off', isFeatured:false, rating:4.5, numReviews:4523, numSold:23000,
    tags:['deal'],
    specs: new Map([['Thickness','6mm'],['Material','Natural Rubber'],['Size','185cm × 68cm'],['Weight','2.5 kg'],['Non-Slip','GripForce']]),
  },
  {
    name:'Atomic Habits by James Clear', slug:'atomic-habits-james-clear',
    description:'#1 NYT Bestseller. Tiny changes, remarkable results. Proven framework for building good habits and breaking bad ones.',
    price:499, originalPrice:799, category:'Books', brand:'Penguin Random House',
    images:[{url:'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',alt:'Atomic Habits'}],
    countInStock:500, sku:'BOOK-ATOMIC-HABITS', badge:'Best Seller', isFeatured:false, rating:4.9, numReviews:45210, numSold:280000,
    tags:['bestseller'],
    specs: new Map([['Pages','320'],['Language','English'],['Publisher','Penguin'],['ISBN','978-0735211292'],['Format','Paperback']]),
  },
  {
    name:'iPad Pro 12.9" M2', slug:'ipad-pro-12-9-m2',
    description:'M2 chip, Liquid Retina XDR display, Apple Pencil hover. Wi-Fi 6E and Thunderbolt USB-C. The ultimate iPad experience.',
    price:109900, originalPrice:119900, category:'Electronics', brand:'Apple',
    images:[{url:'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80',alt:'iPad Pro'}],
    countInStock:28, sku:'APL-IPAD-PRO-M2', badge:'New', isFeatured:true, rating:4.8, numReviews:3201, numSold:18900,
    tags:['featured','new'],
    specs: new Map([['Chip','Apple M2'],['Display','12.9" Liquid Retina XDR'],['Storage','256GB'],['Camera','12MP Ultra Wide'],['Connectivity','Wi-Fi 6E + Thunderbolt']]),
  },
  {
    name:'Adidas Ultraboost 23', slug:'adidas-ultraboost-23',
    description:'BOOST midsole for incredible energy return. Primeknit+ adapts to every foot movement for a sock-like fit. Built for road running.',
    price:15999, originalPrice:19999, category:'Sports', brand:'Adidas',
    images:[{url:'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',alt:'Adidas Ultraboost'}],
    countInStock:95, sku:'ADIDAS-UB23', badge:'20% Off', isFeatured:true, rating:4.6, numReviews:2876, numSold:34500,
    tags:['featured'],
    specs: new Map([['Upper','Primeknit+'],['Midsole','BOOST'],['Outsole','Continental Rubber'],['Drop','10mm'],['Weight','310g']]),
  },
];

const coupons = [
  { code:'WELCOME10', description:'10% off orders above ₹999',          type:'percentage', value:10, minOrderAmount:999,   maxDiscountAmount:500,  usageLimit:10000, isActive:true, expiresAt: new Date(Date.now()+365*86400000) },
  { code:'FLAT200',   description:'₹200 flat off orders above ₹1,499',  type:'fixed',      value:200, minOrderAmount:1499,  usageLimit:5000,        isActive:true, expiresAt: new Date(Date.now()+90*86400000) },
  { code:'SAVE500',   description:'₹500 flat off orders above ₹4,999',  type:'fixed',      value:500, minOrderAmount:4999,  usageLimit:2000,        isActive:true, expiresAt: new Date(Date.now()+60*86400000) },
  { code:'TECH15',    description:'15% off Electronics above ₹9,999',   type:'percentage', value:15, minOrderAmount:9999,  maxDiscountAmount:2000, usageLimit:1000, isActive:true, expiresAt: new Date(Date.now()+30*86400000) },
];

// ─── IMPORT ───────────────────────────────────────────────────────────────────
const importData = async () => {
  try {
    await connectDB();

    // Clear existing
    await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany(), Coupon.deleteMany(), Cart.deleteMany()]);
    console.log('🗑️  Existing data cleared'.yellow);

    // Insert users (must save individually so pre-save hook hashes passwords)
    const createdUsers = [];
    for (const u of users) {
      const doc = new User(u);
      await doc.save();
      createdUsers.push(doc);
    }
    console.log(`✅ ${createdUsers.length} users inserted`.green);
    const [adminUser, customer1, customer2] = createdUsers;

    // Insert products
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ ${createdProducts.length} products inserted`.green);

    // Insert coupons
    await Coupon.insertMany(coupons);
    console.log(`✅ ${coupons.length} coupons inserted`.green);

    // Insert sample orders
    const sampleOrders = [
      {
        user: customer1._id,
        items: [{ product: createdProducts[2]._id, name: createdProducts[2].name, image: createdProducts[2].images[0].url, price: 24990, quantity: 1 }],
        shippingAddress: { street:'42 MG Road', city:'Bengaluru', state:'Karnataka', pincode:'560001' },
        paymentMethod: 'upi', subtotal: 24990, shippingPrice: 0, taxPrice: 4498.2, discountAmount: 0,
        totalPrice: 29488.2, orderStatus: 'Delivered', paymentStatus: 'Paid', paidAt: new Date('2024-01-15'), deliveredAt: new Date('2024-01-18'),
      },
      {
        user: customer1._id,
        items: [
          { product: createdProducts[9]._id, name: createdProducts[9].name, image: createdProducts[9].images[0].url, price: 499, quantity: 2 },
          { product: createdProducts[8]._id, name: createdProducts[8].name, image: createdProducts[8].images[0].url, price: 3499, quantity: 1 },
        ],
        shippingAddress: { street:'42 MG Road', city:'Bengaluru', state:'Karnataka', pincode:'560001' },
        paymentMethod: 'card', couponCode:'FLAT200', subtotal: 4497, shippingPrice: 0, taxPrice: 809.46, discountAmount: 200,
        totalPrice: 5106.46, orderStatus: 'Shipped', paymentStatus: 'Paid', paidAt: new Date('2024-02-20'),
      },
      {
        user: customer1._id,
        items: [{ product: createdProducts[6]._id, name: createdProducts[6].name, image: createdProducts[6].images[0].url, price: 7999, quantity: 1 }],
        shippingAddress: { street:'42 MG Road', city:'Bengaluru', state:'Karnataka', pincode:'560001' },
        paymentMethod: 'cod', subtotal: 7999, shippingPrice: 0, taxPrice: 1439.82, discountAmount: 0,
        totalPrice: 9438.82, orderStatus: 'Processing', paymentStatus: 'Pending',
      },
      {
        user: customer2._id,
        items: [{ product: createdProducts[0]._id, name: createdProducts[0].name, image: createdProducts[0].images[0].url, price: 134900, quantity: 1 }],
        shippingAddress: { street:'15 Park Street', city:'Mumbai', state:'Maharashtra', pincode:'400001' },
        paymentMethod: 'card', couponCode:'TECH15', subtotal: 134900, shippingPrice: 0, taxPrice: 24282, discountAmount: 2000,
        totalPrice: 157182, orderStatus: 'Confirmed', paymentStatus: 'Paid', paidAt: new Date('2024-03-05'),
      },
      {
        user: customer2._id,
        items: [{ product: createdProducts[3]._id, name: createdProducts[3].name, image: createdProducts[3].images[0].url, price: 198900, quantity: 1 }],
        shippingAddress: { street:'15 Park Street', city:'Mumbai', state:'Maharashtra', pincode:'400001' },
        paymentMethod: 'netbanking', subtotal: 198900, shippingPrice: 0, taxPrice: 35802, discountAmount: 0,
        totalPrice: 234702, orderStatus: 'Pending', paymentStatus: 'Pending',
      },
    ];
    await Order.insertMany(sampleOrders);
    console.log(`✅ ${sampleOrders.length} orders inserted`.green);

    console.log('\n🌱 Database seeded successfully!'.green.bold);
    console.log('\n📋 Login Credentials:'.cyan.bold);
    console.log('   Admin    → admin@shopiq.com   / Admin@1234'.white);
    console.log('   Customer → priya@example.com  / User@1234'.white);
    console.log('   Customer → rahul@example.com  / User@1234'.white);
    console.log('\n🎟️  Coupon Codes: WELCOME10 | FLAT200 | SAVE500 | TECH15\n'.cyan);
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Seed Error: ${err.message}`.red.bold);
    console.error(err.stack);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany(), Coupon.deleteMany(), Cart.deleteMany()]);
    console.log('🗑️  All data destroyed!'.red.bold);
    process.exit(0);
  } catch (err) {
    console.error(`❌ ${err.message}`.red.bold);
    process.exit(1);
  }
};

if (process.argv[2] === '--import')       importData();
else if (process.argv[2] === '--destroy') destroyData();
else { console.log('Usage: node seed.js --import | --destroy'); process.exit(0); }
