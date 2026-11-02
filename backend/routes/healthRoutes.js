const router = require('express').Router();
const { health } = require('../controllers/healthController');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Server health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server and database are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:   { type: string, example: ok }
 *                 uptime:   { type: number, example: 3600.5 }
 *                 database: { type: string, example: connected }
 */
router.get('/', health);

module.exports = router;