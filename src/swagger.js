const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '🛒 ShopAPI — E-Commerce REST API',
            version: '1.0.0',
            description: `
A full-featured e-commerce REST API built with **Express** and **SQLite**.

## Features
- 🔐 JWT Authentication (register / login)
- 📦 Product catalog with filtering & search
- 🗂️ Category management
- 🛒 Session-based shopping cart
- 📋 Order checkout with stock management

## Quick Start
1. **Register** a user via \`POST /api/auth/register\`
2. **Login** via \`POST /api/auth/login\` to get a JWT token
3. **Browse** products via \`GET /api/products\`
4. **Add to cart** via \`POST /api/cart\`
5. **Checkout** via \`POST /api/orders\`
      `,
            contact: {
                name: 'ShopAPI Support',
                email: 'support@shopapi.dev',
            },
            license: { name: 'ISC' },
        },
        servers: [{ url: 'http://localhost:3000', description: 'Local Development Server' }],
        components: {
            schemas: {
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Wireless Headphones' },
                        description: { type: 'string' },
                        price: { type: 'number', example: 129.99 },
                        stock: { type: 'integer', example: 50 },
                        category_id: { type: 'integer', example: 1 },
                        category_name: { type: 'string', example: 'Electronics' },
                        image_url: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Category: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Electronics' },
                        slug: { type: 'string', example: 'electronics' },
                        description: { type: 'string' },
                    },
                },
                CartItem: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        product_id: { type: 'integer' },
                        name: { type: 'string' },
                        price: { type: 'number' },
                        quantity: { type: 'integer' },
                        subtotal: { type: 'number' },
                    },
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        user_id: { type: 'integer' },
                        status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
                        total: { type: 'number' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string', enum: ['customer', 'admin'] },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token from the /api/auth/login response',
                },
            },
        },
    },
    apis: ['./src/routes/*.js'], // Read JSDoc from all route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
