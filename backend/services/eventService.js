/**
 * eventService.js
 * Central service for persisting and querying user behavioural events.
 * All writes are fire-and-forget (never block request handlers).
 */

const { Event } = require('../models/Event');

// ── Helpers ──────────────────────────────────────────────────────────────────

function inferDevice(ua = '') {
  if (!ua) return 'unknown';
  const s = ua.toLowerCase();
  if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(s)) return 'mobile';
  if (/ipad|tablet/.test(s)) return 'tablet';
  return 'desktop';
}

function getIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    null
  );
}

// ── Core persist ─────────────────────────────────────────────────────────────

/**
 * track(req, eventType, payload?)
 * Fire-and-forget — never throws, never blocks the main request.
 */
async function track(req, eventType, payload = {}) {
  try {
    const ua        = req.headers['user-agent'] || null;
    const sessionId = req.headers['x-session-id'] || 'anonymous';
    const userId    = req.user?._id || null;

    await Event.create({
      userId,
      sessionId,
      eventType,
      page:       payload.page     || req.headers['referer'] || null,
      referrer:   req.headers['referer'] || null,
      payload,
      userAgent:  ua,
      ip:         getIp(req),
      device:     inferDevice(ua),
      occurredAt: new Date(),
    });
  } catch (err) {
    console.error('[EventService] track error:', err.message);
  }
}

/**
 * trackBatch(events[], req)
 * Bulk-insert events sent from the frontend in one HTTP call.
 */
async function trackBatch(events = [], req) {
  if (!events.length) return;
  try {
    const ua        = req.headers['user-agent'] || null;
    const sessionId = req.headers['x-session-id'] || 'anonymous';
    const userId    = req.user?._id || null;
    const ip        = getIp(req);
    const device    = inferDevice(ua);

    const docs = events.map(e => ({
      userId,
      sessionId,
      eventType:  e.eventType,
      page:       e.page     || null,
      referrer:   e.referrer || null,
      payload:    e.payload  || {},
      userAgent:  ua,
      ip,
      device,
      occurredAt: e.occurredAt ? new Date(e.occurredAt) : new Date(),
    }));

    await Event.insertMany(docs, { ordered: false });
  } catch (err) {
    console.error('[EventService] trackBatch error:', err.message);
  }
}

// ── Analytics queries ─────────────────────────────────────────────────────────

async function dailyCounts(eventType, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return Event.aggregate([
    { $match: { eventType, occurredAt: { $gte: since } } },
    { $group: {
        _id:   { $dateToString: { format: '%Y-%m-%d', date: '$occurredAt' } },
        count: { $sum: 1 },
    }},
    { $sort: { _id: 1 } },
  ]);
}

async function topProducts(eventType = 'product_view', limit = 10, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return Event.aggregate([
    { $match: { eventType, occurredAt: { $gte: since }, 'payload.productId': { $ne: null } } },
    { $group: {
        _id:         '$payload.productId',
        productName: { $first: '$payload.productName' },
        count:       { $sum: 1 },
    }},
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
}

async function conversionFunnel(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const steps = ['cart_add', 'checkout_start', 'order_placed'];

  return Promise.all(
    steps.map(step =>
      Event.distinct('sessionId', { eventType: step, occurredAt: { $gte: since } })
        .then(ids => ({ step, uniqueSessions: ids.length }))
    )
  );
}

async function topSearches(limit = 20, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return Event.aggregate([
    { $match: { eventType: 'search', occurredAt: { $gte: since }, 'payload.query': { $ne: null } } },
    { $group: { _id: '$payload.query', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
}

async function userTimeline(userId, limit = 50) {
  return Event.find({ userId })
    .sort({ occurredAt: -1 })
    .limit(limit)
    .select('eventType page payload occurredAt device')
    .lean();
}

async function summaryStats(days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [totalEvents, uniqueUsers, uniqueSessions, byType] = await Promise.all([
    Event.countDocuments({ occurredAt: { $gte: since } }),
    Event.distinct('userId',    { occurredAt: { $gte: since }, userId: { $ne: null } }).then(r => r.length),
    Event.distinct('sessionId', { occurredAt: { $gte: since } }).then(r => r.length),
    Event.aggregate([
      { $match: { occurredAt: { $gte: since } } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return { totalEvents, uniqueUsers, uniqueSessions, byType };
}

module.exports = { track, trackBatch, dailyCounts, topProducts, conversionFunnel, topSearches, userTimeline, summaryStats };