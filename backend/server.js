require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('colors');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

connectDB();

const app = express();

// Trust proxy — required for rate-limit when behind a proxy/load balancer
// Set to 1 for local dev (React proxy) and production reverse proxies
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Rate limits
app.use('/api/', rateLimit({ windowMs:15*60*1000, max:300, standardHeaders:true, legacyHeaders:false }));
app.use('/api/auth/login', rateLimit({ windowMs:15*60*1000, max:20 }));

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'ShopIQ API Docs',
  swaggerOptions: { persistAuthorization: true },
}));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// Routes
app.use('/api/health',    require('./routes/healthRoutes'));
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/products',  require('./routes/productRoutes'));
app.use('/api/cart',      require('./routes/cartRoutes'));
app.use('/api/orders',    require('./routes/orderRoutes'));
app.use('/api/coupons',   require('./routes/couponRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));
app.use('/api/events',    require('./routes/eventRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`\n🚀 Server running on http://localhost:${PORT}`.green.bold + ` [${process.env.NODE_ENV}]`.yellow));

module.exports = app;