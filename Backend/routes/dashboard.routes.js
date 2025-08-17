import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  getDashboardData,
  getAnalytics
} from '../controllers/dashboardController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard data and analytics
 */

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @swagger
 * /dashboard/data:
 *   get:
 *     summary: Get dashboard overview data
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardData'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/data', getDashboardData);

/**
 * @swagger
 * /dashboard/analytics:
 *   get:
 *     summary: Get detailed analytics data
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 security:
 *                   type: object
 *                   properties:
 *                     score:
 *                       type: number
 *                       description: Security score (0-100)
 *                     trends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           score:
 *                             type: number
 *                 threats:
 *                   type: object
 *                   properties:
 *                     byType:
 *                       type: object
 *                       description: Threats grouped by type
 *                     bySeverity:
 *                       type: object
 *                       description: Threats grouped by severity
 *                     timeline:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           count:
 *                             type: number
 *                 performance:
 *                   type: object
 *                   properties:
 *                     avgScanTime:
 *                       type: number
 *                     scanVolume:
 *                       type: object
 *                       properties:
 *                         daily:
 *                           type: number
 *                         weekly:
 *                           type: number
 *                         monthly:
 *                           type: number
 *                 compliance:
 *                   type: object
 *                   properties:
 *                     score:
 *                       type: number
 *                     violations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           count:
 *                             type: number
 *                           severity:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/analytics', getAnalytics);

export default router;

