const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShopIQ API',
      version: '1.0.0',
      description: 'REST API documentation for ShopIQ — an e-commerce platform built with the MERN stack.',
      contact: { name: 'ShopIQ Team' },
    },
    servers: [
      { url: 'http://localhost:5000/api', description: 'Local Development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token. Obtain it from POST /auth/login',
        },
      },
      schemas: {
        // ── Auth ────────────────────────────────────────────────────────────
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name:     { type: 'string', example: 'Priya Sharma' },
            email:    { type: 'string', format: 'email', example: 'priya@example.com' },
            password: { type: 'string', minLength: 6, example: 'User@1234' },
            phone:    { type: 'string', example: '9876543210' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'priya@example.com' },
            password: { type: 'string', example: 'User@1234' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            _id:      { type: 'string', example: '64a1b2c3d4e5f6789abc1234' },
            name:     { type: 'string', example: 'Priya Sharma' },
            email:    { type: 'string', example: 'priya@example.com' },
            role:     { type: 'string', enum: ['customer', 'admin'], example: 'customer' },
            token:    { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            wishlist: { type: 'array', items: { type: 'string' } },
          },
        },
        // ── Product ─────────────────────────────────────────────────────────
        Product: {
          type: 'object',
          properties: {
            _id:           { type: 'string' },
            name:          { type: 'string', example: 'Samsung Galaxy S24' },
            slug:          { type: 'string', example: 'samsung-galaxy-s24' },
            description:   { type: 'string' },
            price:         { type: 'number', example: 74999 },
            originalPrice: { type: 'number', example: 84999 },
            discount:      { type: 'number', example: 12 },
            category:      { type: 'string', enum: ['Electronics','Fashion','Home & Kitchen','Sports','Books','Beauty','Toys'] },
            brand:         { type: 'string', example: 'Samsung' },
            images:        { type: 'array', items: { type: 'object', properties: { url: { type: 'string' }, alt: { type: 'string' } } } },
            countInStock:  { type: 'integer', example: 50 },
            rating:        { type: 'number', example: 4.5 },
            numReviews:    { type: 'integer', example: 128 },
            isFeatured:    { type: 'boolean', example: true },
            isActive:      { type: 'boolean', example: true },
          },
        },
        ProductInput: {
          type: 'object',
          required: ['name', 'description', 'price', 'category', 'brand', 'countInStock'],
          properties: {
            name:          { type: 'string', example: 'Samsung Galaxy S24' },
            description:   { type: 'string' },
            price:         { type: 'number', example: 74999 },
            originalPrice: { type: 'number', example: 84999 },
            category:      { type: 'string', enum: ['Electronics','Fashion','Home & Kitchen','Sports','Books','Beauty','Toys'] },
            brand:         { type: 'string', example: 'Samsung' },
            countInStock:  { type: 'integer', example: 50 },
            images:        { type: 'array', items: { type: 'object', properties: { url: { type: 'string' }, alt: { type: 'string' } } } },
            isFeatured:    { type: 'boolean', example: false },
          },
        },
        ReviewInput: {
          type: 'object',
          required: ['rating', 'comment'],
          properties: {
            rating:  { type: 'number', minimum: 1, maximum: 5, example: 4 },
            comment: { type: 'string', example: 'Great product, fast delivery!' },
          },
        },
        // ── Cart ────────────────────────────────────────────────────────────
        CartItem: {
          type: 'object',
          properties: {
            product:  { $ref: '#/components/schemas/Product' },
            quantity: { type: 'integer', example: 2 },
            price:    { type: 'number', example: 74999 },
          },
        },
        Cart: {
          type: 'object',
          properties: {
            items:          { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
            couponCode:     { type: 'string', example: 'SAVE10' },
            discountAmount: { type: 'number', example: 500 },
            total:          { type: 'number', example: 149498 },
          },
        },
        AddToCartInput: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: { type: 'string', example: '64a1b2c3d4e5f6789abc1234' },
            quantity:  { type: 'integer', minimum: 1, example: 1 },
          },
        },
        // ── Order ───────────────────────────────────────────────────────────
        OrderItem: {
          type: 'object',
          properties: {
            product:  { type: 'string', description: 'Product ID' },
            name:     { type: 'string' },
            image:    { type: 'string' },
            price:    { type: 'number' },
            quantity: { type: 'integer' },
          },
        },
        ShippingAddress: {
          type: 'object',
          required: ['fullName', 'addressLine1', 'city', 'state', 'pincode', 'phone'],
          properties: {
            fullName:     { type: 'string', example: 'Priya Sharma' },
            addressLine1: { type: 'string', example: '42 MG Road' },
            addressLine2: { type: 'string', example: 'Apt 3B' },
            city:         { type: 'string', example: 'Bengaluru' },
            state:        { type: 'string', example: 'Karnataka' },
            pincode:      { type: 'string', example: '560001' },
            phone:        { type: 'string', example: '9876543210' },
          },
        },
        CreateOrderInput: {
          type: 'object',
          required: ['items', 'shippingAddress', 'paymentMethod'],
          properties: {
            items:           { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            shippingAddress: { $ref: '#/components/schemas/ShippingAddress' },
            paymentMethod:   { type: 'string', enum: ['cod', 'upi', 'card', 'netbanking'], example: 'cod' },
            couponCode:      { type: 'string', example: 'SAVE10' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id:             { type: 'string' },
            user:            { type: 'string' },
            items:           { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            shippingAddress: { $ref: '#/components/schemas/ShippingAddress' },
            paymentMethod:   { type: 'string' },
            subtotal:        { type: 'number' },
            tax:             { type: 'number' },
            shippingCost:    { type: 'number' },
            discount:        { type: 'number' },
            total:           { type: 'number' },
            orderStatus:     { type: 'string', enum: ['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'] },
            paymentStatus:   { type: 'string', enum: ['Pending','Paid','Failed','Refunded'] },
            createdAt:       { type: 'string', format: 'date-time' },
          },
        },
        // ── Coupon ──────────────────────────────────────────────────────────
        CouponInput: {
          type: 'object',
          required: ['code', 'discountType', 'discountValue'],
          properties: {
            code:               { type: 'string', example: 'SAVE10' },
            discountType:       { type: 'string', enum: ['percentage', 'fixed'], example: 'percentage' },
            discountValue:      { type: 'number', example: 10 },
            minOrderAmount:     { type: 'number', example: 500 },
            maxDiscountAmount:  { type: 'number', example: 200 },
            usageLimit:         { type: 'integer', example: 100 },
            perUserLimit:       { type: 'integer', example: 1 },
            expiresAt:          { type: 'string', format: 'date-time' },
          },
        },
        ApplyCouponInput: {
          type: 'object',
          required: ['code', 'orderAmount'],
          properties: {
            code:        { type: 'string', example: 'SAVE10' },
            orderAmount: { type: 'number', example: 1500 },
          },
        },
        // ── Common ──────────────────────────────────────────────────────────
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Resource not found' },
          },
        },
        SuccessMessage: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Operation successful' },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Unauthorized — missing or invalid JWT token',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        Forbidden: {
          description: 'Forbidden — admin access required',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        NotFound: {
          description: 'Resource not found',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        ValidationError: {
          description: 'Validation error — check request body',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
      },
    },
    tags: [
      { name: 'Health',   description: 'Server health check' },
      { name: 'Auth',     description: 'Register, login, profile, wishlist' },
      { name: 'Products', description: 'Browse, search, filter, review products' },
      { name: 'Cart',     description: 'Guest & authenticated cart management' },
      { name: 'Orders',   description: 'Place and track orders' },
      { name: 'Coupons',  description: 'Apply and manage discount coupons' },
      { name: 'Admin',    description: 'Admin-only: stats, orders, users' },
      { name: 'Events',   description: 'Analytics event tracking' },
    ],
  },
  // Point to all route files to pick up JSDoc @swagger comments
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);