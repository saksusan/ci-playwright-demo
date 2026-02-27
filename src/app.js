const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const { initializeDatabase } = require('./db/database');

// Route modules
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');

// ── Bootstrap DB ────────────────────────────────────────────────────────────
initializeDatabase();

// ── App ──────────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ── Static UI ────────────────────────────────────────────────────────────────
// Serves the HTML store page so existing Playwright tests still work
app.use(express.static(path.join(__dirname, 'public')));

// ── Swagger Docs ─────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: '🛒 ShopAPI Docs',
    customCss: `
    .swagger-ui .topbar { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }
    .swagger-ui .topbar-wrapper img { display: none; }
    .swagger-ui .topbar-wrapper::after {
      content: '🛒 ShopAPI';
      color: #e94560;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 1px;
    }
  `,
    swaggerOptions: { persistAuthorization: true },
}));

// Expose the raw JSON spec for external tools
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);

// Legacy /api/login for backward compatibility with Playwright tests
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password123') {
        res.status(200).send({ message: 'Login Successful' });
    } else {
        res.status(401).send({ message: 'Invalid Credentials' });
    }
});

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        app: 'ShopAPI',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        docs: 'http://localhost:3000/api-docs',
    });
});

// ── 404 fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(3000, () => {
    console.log('');
    console.log('🚀  ShopAPI is running!');
    console.log('');
    console.log('   📌  Store UI    →  http://localhost:3000');
    console.log('   📖  Swagger UI  →  http://localhost:3000/api-docs');
    console.log('   💓  Health      →  http://localhost:3000/api/health');
    console.log('');
});