// src/config/swagger.ts
import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0', // OpenAPI version
    info: {
      title: 'Your API Title',
      version: '1.0.0',
      description: 'API documentation for your Node.js backend',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Your API server URL
      },
    ],
  },
  apis: ['src/routes/*.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
export default swaggerDocs;