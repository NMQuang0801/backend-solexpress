const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "User Management API",
      version: "1.0.0",
      description: "API documentation for managing users",
    },
  },
  apis: ["./server/routes/*.js"],
};

// Initialize Swagger docs
const swaggerSpecs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpecs };
