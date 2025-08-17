import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  scanText,
  scanFile,
  getScanHistory,
  getScanDetails,
  deleteScan,
  getScanStats
} from '../controllers/scanController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Scanning
 *   description: Data scanning and threat detection operations
 */

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @swagger
 * /scan/text:
 *   post:
 *     summary: Scan text content for sensitive information
 *     tags: [Scanning]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Text content to scan
 *           example:
 *             content: "My email is john@example.com and my phone is 555-123-4567"
 *     responses:
 *       200:
 *         description: Text scan completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScanResult'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/text', scanText);

/**
 * @swagger
 * /scan/file:
 *   post:
 *     summary: Scan uploaded file for sensitive information
 *     tags: [Scanning]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to scan (PDF, DOC, DOCX, TXT, JPG, PNG)
 *     responses:
 *       200:
 *         description: File scan completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScanResult'
 *       400:
 *         description: Invalid file or request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       413:
 *         description: File too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/file', scanFile);

/**
 * @swagger
 * /scan/history:
 *   get:
 *     summary: Get scan history with pagination
 *     tags: [Scanning]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Scan history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 docs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScanResult'
 *                 totalDocs:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 hasNextPage:
 *                   type: boolean
 *                 hasPrevPage:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/history', getScanHistory);

/**
 * @swagger
 * /scan/stats:
 *   get:
 *     summary: Get scan statistics
 *     tags: [Scanning]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Scan statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalScans:
 *                   type: integer
 *                   description: Total number of scans
 *                 cleanScans:
 *                   type: integer
 *                   description: Number of clean scans
 *                 threatsDetected:
 *                   type: integer
 *                   description: Total threats detected
 *                 avgScanTime:
 *                   type: string
 *                   description: Average scan time
 *                 scanTypes:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: integer
 *                     file:
 *                       type: integer
 *                 threatTypes:
 *                   type: object
 *                   properties:
 *                     personal:
 *                       type: integer
 *                     financial:
 *                       type: integer
 *                     credentials:
 *                       type: integer
 *                     network:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', getScanStats);

/**
 * @swagger
 * /scan/{scanId}:
 *   get:
 *     summary: Get scan details by ID
 *     tags: [Scanning]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: scanId
 *         required: true
 *         schema:
 *           type: string
 *         description: Scan ID
 *     responses:
 *       200:
 *         description: Scan details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScanResult'
 *       404:
 *         description: Scan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:scanId', getScanDetails);

/**
 * @swagger
 * /scan/{scanId}:
 *   delete:
 *     summary: Delete scan by ID
 *     tags: [Scanning]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: scanId
 *         required: true
 *         schema:
 *           type: string
 *         description: Scan ID
 *     responses:
 *       200:
 *         description: Scan deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Scan deleted successfully"
 *       404:
 *         description: Scan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:scanId', deleteScan);

export default router;
