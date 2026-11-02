const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  trackEvent, trackBatch,
  getSummary, getDailyCounts, getTopProducts,
  getFunnel, getTopSearches, getUserTimeline,
} = require('../controllers/eventController');

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Track a single analytics event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type:      { type: string, example: product_view }
 *               productId: { type: string }
 *               userId:    { type: string }
 *               metadata:  { type: object }
 *     responses:
 *       201:
 *         description: Event recorded
 */
router.post('/', trackEvent);

/**
 * @swagger
 * /events/batch:
 *   post:
 *     summary: Track multiple analytics events in one request
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [events]
 *             properties:
 *               events:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:      { type: string }
 *                     productId: { type: string }
 *                     userId:    { type: string }
 *     responses:
 *       201:
 *         description: Events recorded
 */
router.post('/batch', trackBatch);

/**
 * @swagger
 * /events/analytics/summary:
 *   get:
 *     summary: Get overall analytics summary (admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary metrics
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/analytics/summary', protect, adminOnly, getSummary);

/**
 * @swagger
 * /events/analytics/daily:
 *   get:
 *     summary: Get daily event counts (admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: Daily event count array
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/analytics/daily', protect, adminOnly, getDailyCounts);

/**
 * @swagger
 * /events/analytics/top-products:
 *   get:
 *     summary: Get most-viewed products (admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top products by view count
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/analytics/top-products', protect, adminOnly, getTopProducts);

/**
 * @swagger
 * /events/analytics/funnel:
 *   get:
 *     summary: Get conversion funnel data (admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Funnel stages with conversion rates
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/analytics/funnel', protect, adminOnly, getFunnel);

/**
 * @swagger
 * /events/analytics/searches:
 *   get:
 *     summary: Get top search terms (admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top search queries with counts
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/analytics/searches', protect, adminOnly, getTopSearches);

/**
 * @swagger
 * /events/user/{userId}:
 *   get:
 *     summary: Get event timeline for a specific user (admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User event timeline
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/user/:userId', protect, adminOnly, getUserTimeline);

module.exports = router;