const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Solexpress API Documentation',
      version: '1.0.0',
      description: 'API documentation for Solexpress backend',
      contact: {
        name: 'API Support',
        email: 'support@solexpress.com'
      }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

// Initialize Swagger docs
const swaggerSpecs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpecs };
