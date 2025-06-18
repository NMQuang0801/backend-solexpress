const express = require('express');
const router = express.Router();
const labelController = require('../controllers/labelController');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           description: HTTP status code
 *         message:
 *           type: string
 *           description: Response message
 *         data:
 *           type: object
 *           description: Response data
 *         success:
 *           type: boolean
 *           description: Whether the request was successful
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/labels/import:
 *   post:
 *     tags:
 *       - Labels
 *     summary: Import labels from CSV file and send to 3rd party
 *     description: Upload a CSV file, parse and send data to 3rd party API.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file to upload
 *     responses:
 *       200:
 *         description: Import successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/import', verifyToken, labelController.importLabels);

/**
 * @swagger
 * /api/labels:
 *   get:
 *     tags:
 *       - Labels
 *     summary: Get list of labels
 *     description: Get paginated list of imported labels for current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageIndex
 *         schema:
 *           type: integer
 *         description: Page index (default 1)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Page size (default 20)
 *     responses:
 *       200:
 *         description: List of labels
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', verifyToken, labelController.getLabels);

module.exports = router;
