const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/response');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.unauthorized(res, 'Token must start with Bearer');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return ApiResponse.unauthorized(res, 'Token is required');
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return ApiResponse.unauthorized(res, 'Invalid token');
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return ApiResponse.forbidden(res, 'Require admin role');
  }
  next();
};

module.exports = { verifyToken, isAdmin };
