const router = require('express').Router();
const { getStats, getAllOrders, updateOrderStatus, getAllUsers, toggleUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get dashboard statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated stats for orders, revenue, users, and products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:   { type: number, example: 485000 }
 *                 totalOrders:    { type: integer, example: 124 }
 *                 totalUsers:     { type: integer, example: 320 }
 *                 totalProducts:  { type: integer, example: 85 }
 *                 recentOrders:   { type: array, items: { $ref: '#/components/schemas/Order' } }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/stats', getStats);

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders with pagination (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Confirmed, Processing, Shipped, Delivered, Cancelled]
 *     responses:
 *       200:
 *         description: Paginated list of all orders
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/orders', getAllOrders);

/**
 * @swagger
 * /admin/orders/{id}/status:
 *   put:
 *     summary: Update order status (follows state machine transitions)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Confirmed, Processing, Shipped, Delivered, Cancelled]
 *                 example: Shipped
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid status transition
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/orders/:id/status', updateOrderStatus);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Paginated list of users
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /admin/users/{id}/toggle:
 *   put:
 *     summary: Activate or deactivate a user account (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User account toggled
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/users/:id/toggle', toggleUser);

module.exports = router;