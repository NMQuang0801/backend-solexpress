require('dotenv').config();
require('module-alias/register');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express');
const userRoutes = require('./routes/userRoute');
const labelRoutes = require('./routes/labelRoute')
const { swaggerSpecs } = require('./config/swagger');
const pool = require('./config/db');
const app = express();
const PORT = process.env.PORT || 4000;
const { lowercaseKeysMiddleware } = require('./middlewares/middlewareLowercase');
const { verifyToken } = require('./middlewares/authMiddleware');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(lowercaseKeysMiddleware);
// Routes
app.use('/api/users', userRoutes);

const upload = multer({ storage: multer.memoryStorage() });
app.use('/api/labels', upload.single('file'), labelRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Solexpress API Documentation"
}));

// Database connection test
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected successfully!');
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
})();

app.get('/', (req, res) => {
  res.send('Welcome to the backend API!');
});

// API kiểm tra token còn hạn hay không
app.get('/api/check-token', verifyToken, (req, res) => {
  res.status(200).json({ status: 200, message: 'Token is valid' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
}); 