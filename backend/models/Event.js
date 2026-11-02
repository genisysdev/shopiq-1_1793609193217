const mongoose = require('mongoose');

/**
 * UserEvent — captures every meaningful user behavioural action.
 *
 * eventType enum covers the full funnel:
 *   Discovery  : page_view, search
 *   Engagement : product_view, product_impression, wishlist_add, wishlist_remove
 *   Commerce   : cart_add, cart_remove, cart_update, checkout_start,
 *                checkout_step, order_placed, order_cancelled
 *   Session    : session_start, session_end
 *   Auth       : login, logout, register
 *   Error      : client_error
 */

const EVENT_TYPES = [
  // Discovery
  'page_view', 'search',
  // Engagement
  'product_view', 'product_impression', 'wishlist_add', 'wishlist_remove',
  // Commerce
  'cart_add', 'cart_remove', 'cart_update',
  'checkout_start', 'checkout_step', 'order_placed', 'order_cancelled',
  // Session
  'session_start', 'session_end',
  // Auth
  'login', 'logout', 'register',
  // Error
  'client_error',
];

const eventSchema = new mongoose.Schema({
  // ── Identity ────────────────────────────────────────────────────
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  sessionId: { type: String, required: true, index: true },   // anonymous & logged-in both carry this

  // ── What happened ────────────────────────────────────────────────
  eventType: { type: String, required: true, enum: EVENT_TYPES, index: true },

  // ── Where it happened ───────────────────────────────────────────
  page:     { type: String, default: null },    // e.g. '/products', '/product/iphone-15'
  referrer: { type: String, default: null },

  // ── Flexible payload (event-specific data) ──────────────────────
  payload: {
    // product events
    productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    productName: { type: String, default: null },
    category:    { type: String, default: null },
    brand:       { type: String, default: null },
    price:       { type: Number, min: 0, default: null },

    // search
    query:       { type: String, default: null },
    resultsCount:{ type: Number, min: 0, default: null },

    // cart / order
    quantity:    { type: Number, min: 1, default: null },
    orderId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    orderTotal:  { type: Number, min: 0, default: null },

    // checkout step
    step:        { type: Number, min: 1, default: null },
    stepName:    { type: String, default: null },

    // pagination / filters
    filters:     { type: Map, of: String, default: null },
    page:        { type: Number, min: 1, default: null },

    // error
    errorMessage:{ type: String, default: null },
    errorStack:  { type: String, default: null },

    // catch-all for future fields
    extra:       { type: Map, of: mongoose.Schema.Types.Mixed, default: null },
  },

  // ── Device / context ────────────────────────────────────────────
  userAgent: { type: String, default: null },
  ip:        { type: String, default: null },
  device:    { type: String, enum: ['desktop', 'mobile', 'tablet', 'unknown'], default: 'unknown' },

  // ── Timing ──────────────────────────────────────────────────────
  occurredAt: { type: Date, default: Date.now, index: true },

}, {
  timestamps: false,     // occurredAt is our timestamp — skip createdAt/updatedAt overhead
  versionKey: false,
});

// Compound indexes for common analytics queries
eventSchema.index({ eventType: 1, occurredAt: -1 });
eventSchema.index({ userId: 1, eventType: 1, occurredAt: -1 });
eventSchema.index({ sessionId: 1, occurredAt: 1 });
eventSchema.index({ 'payload.productId': 1, eventType: 1 });
eventSchema.index({ 'payload.category': 1, eventType: 1 });

// TTL — auto-delete raw events after 90 days to control storage
eventSchema.index({ occurredAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Event = mongoose.model('Event', eventSchema);
module.exports = { Event, EVENT_TYPES };