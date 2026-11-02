const router = require('express').Router();
const { applyCoupon, getCoupons, createCoupon, toggleCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /coupons/apply:
 *   post:
 *     summary: Validate and apply a coupon code to an order amount
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyCouponInput'
 *     responses:
 *       200:
 *         description: Coupon is valid — returns discount amount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 discountAmount: { type: number, example: 150 }
 *                 message:        { type: string, example: 'Coupon applied! You save ₹150' }
 *       400:
 *         description: Invalid, expired, or usage-limit-exceeded coupon
 */
router.post('/apply', applyCoupon);

/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: List all coupons (admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of coupon objects
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     summary: Create a new coupon (admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CouponInput'
 *     responses:
 *       201:
 *         description: Coupon created
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', protect, adminOnly, getCoupons);
router.post('/', protect, adminOnly, createCoupon);

/**
 * @swagger
 * /coupons/{id}/toggle:
 *   put:
 *     summary: Enable or disable a coupon (admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Coupon toggled
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/:id/toggle', protect, adminOnly, toggleCoupon);

/**
 * @swagger
 * /coupons/{id}:
 *   delete:
 *     summary: Delete a coupon (admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Coupon deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.delete('/:id', protect, adminOnly, deleteCoupon);

module.exports = router;