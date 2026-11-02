const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, getMe, updateMe, toggleWishlist } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/register',
  [body('name').trim().notEmpty(), body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 6 })],
  validate, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful — returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate, login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   put:
 *     summary: Update current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:     { type: string, example: Priya Sharma }
 *               phone:    { type: string, example: '9876543210' }
 *               address:
 *                 type: object
 *                 properties:
 *                   street: { type: string }
 *                   city:   { type: string }
 *                   state:  { type: string }
 *                   pincode:{ type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

/**
 * @swagger
 * /auth/wishlist/{productId}:
 *   put:
 *     summary: Toggle a product in the user's wishlist (add if absent, remove if present)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the product
 *     responses:
 *       200:
 *         description: Updated wishlist array of product IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wishlist:
 *                   type: array
 *                   items: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;