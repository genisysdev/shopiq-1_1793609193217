const router = require('express').Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get the current cart (guest or authenticated)
 *     tags: [Cart]
 *     description: For guest users, pass the `x-session-id` header. For logged-in users, the JWT is used.
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema: { type: string }
 *         description: Guest session ID (use when not logged in)
 *     responses:
 *       200:
 *         description: Current cart contents
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *   post:
 *     summary: Add a product to the cart
 *     tags: [Cart]
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCartInput'
 *     responses:
 *       200:
 *         description: Updated cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Insufficient stock
 *   delete:
 *     summary: Clear the entire cart
 *     tags: [Cart]
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cart cleared
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 */
router.get('/', getCart);
router.post('/', addToCart);
router.delete('/', clearCart);

/**
 * @swagger
 * /cart/{productId}:
 *   put:
 *     summary: Update the quantity of a cart item
 *     tags: [Cart]
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema: { type: string }
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer, minimum: 1, example: 3 }
 *     responses:
 *       200:
 *         description: Updated cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Insufficient stock
 *   delete:
 *     summary: Remove a specific item from the cart
 *     tags: [Cart]
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema: { type: string }
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item removed, updated cart returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);

module.exports = router;