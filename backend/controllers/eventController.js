const asyncHandler = require('express-async-handler');
const { EVENT_TYPES } = require('../models/Event');
const eventService = require('../services/eventService');

/**
 * POST /api/events
 * Single event from frontend (or server-side calls via eventService.track).
 */
const trackEvent = asyncHandler(async (req, res) => {
  const { eventType, payload = {}, page, referrer, occurredAt } = req.body;

  if (!eventType || !EVENT_TYPES.includes(eventType)) {
    res.status(400);
    throw new Error(`Invalid eventType. Must be one of: ${EVENT_TYPES.join(', ')}`);
  }

  // Attach page/referrer into payload so track() can pick them up
  await eventService.track(req, eventType, {
    ...payload,
    page:      page     || null,
    referrer:  referrer || null,
    occurredAt: occurredAt || null,
  });

  res.status(202).json({ success: true });
});

/**
 * POST /api/events/batch
 * Bulk flush from frontend event queue (called on page unload / interval).
 * Accepts up to 50 events per call.
 */
const trackBatch = asyncHandler(async (req, res) => {
  const { events } = req.body;

  if (!Array.isArray(events) || events.length === 0) {
    res.status(400);
    throw new Error('events must be a non-empty array');
  }

  if (events.length > 50) {
    res.status(400);
    throw new Error('Maximum 50 events per batch');
  }

  // Validate each event type
  const invalid = events.filter(e => !EVENT_TYPES.includes(e.eventType));
  if (invalid.length) {
    res.status(400);
    throw new Error(`Invalid eventTypes: ${[...new Set(invalid.map(e => e.eventType))].join(', ')}`);
  }

  await eventService.trackBatch(events, req);
  res.status(202).json({ success: true, accepted: events.length });
});

// ── Admin analytics endpoints ────────────────────────────────────────────────

/**
 * GET /api/events/analytics/summary?days=7
 */
const getSummary = asyncHandler(async (req, res) => {
  const days = Math.min(parseInt(req.query.days) || 7, 90);
  const data = await eventService.summaryStats(days);
  res.json(data);
});

/**
 * GET /api/events/analytics/daily?eventType=product_view&days=30
 */
const getDailyCounts = asyncHandler(async (req, res) => {
  const { eventType = 'product_view', days = 30 } = req.query;
  if (!EVENT_TYPES.includes(eventType)) {
    res.status(400); throw new Error('Invalid eventType');
  }
  const data = await eventService.dailyCounts(eventType, Math.min(parseInt(days), 90));
  res.json(data);
});

/**
 * GET /api/events/analytics/top-products?eventType=product_view&limit=10&days=30
 */
const getTopProducts = asyncHandler(async (req, res) => {
  const { eventType = 'product_view', limit = 10, days = 30 } = req.query;
  const data = await eventService.topProducts(eventType, parseInt(limit), parseInt(days));
  res.json(data);
});

/**
 * GET /api/events/analytics/funnel?days=30
 */
const getFunnel = asyncHandler(async (req, res) => {
  const days = Math.min(parseInt(req.query.days) || 30, 90);
  const data = await eventService.conversionFunnel(days);
  res.json(data);
});

/**
 * GET /api/events/analytics/searches?limit=20&days=30
 */
const getTopSearches = asyncHandler(async (req, res) => {
  const { limit = 20, days = 30 } = req.query;
  const data = await eventService.topSearches(parseInt(limit), parseInt(days));
  res.json(data);
});

/**
 * GET /api/events/user/:userId?limit=50   (admin)
 */
const getUserTimeline = asyncHandler(async (req, res) => {
  const data = await eventService.userTimeline(req.params.userId, parseInt(req.query.limit) || 50);
  res.json(data);
});

module.exports = { trackEvent, trackBatch, getSummary, getDailyCounts, getTopProducts, getFunnel, getTopSearches, getUserTimeline };