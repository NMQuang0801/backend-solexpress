const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/response');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json(
      ApiResponse.unauthorized('Authorization header is required')
    );
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json(
      ApiResponse.unauthorized('Token must start with Bearer')
    );
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json(
      ApiResponse.unauthorized('Token is required')
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json(
      ApiResponse.unauthorized('Invalid token')
    );
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json(
      ApiResponse.forbidden('Require admin role')
    );
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin
}; 