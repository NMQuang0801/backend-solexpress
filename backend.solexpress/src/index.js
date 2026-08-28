require('dotenv').config();
require('module-alias/register');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express');
const userRoutes = require('./routes/userRoute');
const labelRoutes = require('./routes/labelRoute');
const etowerLabelRoutes = require('./routes/etowerLabelRoute');
const { swaggerSpecs } = require('./config/swagger');
const pool = require('./config/db');
const ApiResponse = require('./utils/response');
const { lowercaseKeysMiddleware } = require('./middlewares/middlewareLowercase');
const { verifyToken } = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(lowercaseKeysMiddleware);

app.use('/api/users', userRoutes);

const upload = multer({ storage: multer.memoryStorage() });
app.use('/api/labels', upload.single('file'), labelRoutes);
app.use('/api/etower-labels', upload.single('file'), etowerLabelRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Solexpress API Documentation"
}));

(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected successfully!');
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
})();

app.get('/', (_req, res) => {
  res.send('Welcome to the backend API!');
});

app.get('/health', (_req, res) => {
  res.send('Welcome to the backend API! v1.0.3');
});

app.get('/api/check-token', verifyToken, (_req, res) => {
  ApiResponse.success(res, null, 'Token is valid');
});

app.use((_req, res) => {
  ApiResponse.notFound(res, 'Endpoint not found!');
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  ApiResponse.serverError(res, 'Something went wrong!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
