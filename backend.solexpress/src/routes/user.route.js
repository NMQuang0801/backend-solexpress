const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

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
 * /api/users/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register a new user (Admin only)
 *     description: Create a new user account (requires admin role)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               username:
 *                 type: string
 *                 description: User's username
 *               password:
 *                 type: string
 *                 description: User's password
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 description: User's role
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/register', verifyToken, isAdmin, userController.registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login user
 *     description: Authenticate user and return JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                         user:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             username:
 *                               type: string
 *                             role:
 *                               type: string
 */
router.post('/login', userController.loginUser);

module.exports = router;
