const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');
const { JWT_SECRET, authenticate, requireAdmin } = require('../middleware/auth');

// ── Hardcoded admin credentials ──────────────────────────────────────────────
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

/**
 * POST /api/admin/login
 * Admin-only login with hardcoded credentials
 */
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required' });
    }
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    const token = jwt.sign(
        { id: 0, username: ADMIN_USERNAME, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '8h' }
    );
    res.json({ message: 'Admin login successful', token, user: { username: ADMIN_USERNAME, role: 'admin' } });
});

// All routes below require a valid admin JWT
router.use(authenticate, requireAdmin);

/**
 * GET /api/admin/stats
 * Dashboard summary counts
 */
router.get('/stats', (req, res) => {
    const products = db.prepare('SELECT COUNT(*) as n FROM products').get().n;
    const categories = db.prepare('SELECT COUNT(*) as n FROM categories').get().n;
    const users = db.prepare('SELECT COUNT(*) as n FROM users').get().n;
    const orders = db.prepare('SELECT COUNT(*) as n FROM orders').get().n;
    const totalRevenue = db.prepare("SELECT COALESCE(SUM(total),0) as total FROM orders WHERE status != 'cancelled'").get().total;
    res.json({ products, categories, users, orders, totalRevenue });
});

/**
 * GET /api/admin/products
 * All products (with category info)
 */
router.get('/products', (req, res) => {
    const products = db.prepare(`
        SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
    `).all();
    res.json(products);
});

/**
 * POST /api/admin/products
 * Create a new product
 */
router.post('/products', (req, res) => {
    const { name, description, price, stock, category_id, image_url } = req.body;
    if (!name || price == null || stock == null) {
        return res.status(400).json({ error: 'name, price, and stock are required' });
    }
    const result = db.prepare(`
        INSERT INTO products (name, description, price, stock, category_id, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, description || null, parseFloat(price), parseInt(stock), category_id || null, image_url || null);
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Product created', product });
});

/**
 * PUT /api/admin/products/:id
 * Update an existing product
 */
router.put('/products/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { name, description, price, stock, category_id, image_url } = req.body;
    db.prepare(`
        UPDATE products
        SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, image_url = ?
        WHERE id = ?
    `).run(
        name ?? existing.name,
        description ?? existing.description,
        price != null ? parseFloat(price) : existing.price,
        stock != null ? parseInt(stock) : existing.stock,
        category_id !== undefined ? category_id : existing.category_id,
        image_url !== undefined ? image_url : existing.image_url,
        req.params.id
    );
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json({ message: 'Product updated', product: updated });
});

/**
 * DELETE /api/admin/products/:id
 * Delete a product
 */
router.delete('/products/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
});

/**
 * GET /api/admin/categories
 * All categories
 */
router.get('/categories', (req, res) => {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json(categories);
});

/**
 * POST /api/admin/categories
 * Create a new category
 */
router.post('/categories', (req, res) => {
    const { name, slug, description } = req.body;
    if (!name || !slug) {
        return res.status(400).json({ error: 'name and slug are required' });
    }
    try {
        const result = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)').run(name, slug, description || null);
        const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ message: 'Category created', category });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Category name or slug already exists' });
        }
        res.status(500).json({ error: 'Failed to create category', details: err.message });
    }
});

/**
 * DELETE /api/admin/categories/:id
 * Delete a category
 */
router.delete('/categories/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Category not found' });
    db.prepare('UPDATE products SET category_id = NULL WHERE category_id = ?').run(req.params.id);
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ message: 'Category deleted' });
});

/**
 * GET /api/admin/users
 * All users
 */
router.get('/users', (req, res) => {
    const users = db.prepare('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
});

/**
 * GET /api/admin/orders
 * All orders with items
 */
router.get('/orders', (req, res) => {
    const orders = db.prepare(`
        SELECT o.*, u.username
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
    `).all();
    res.json(orders);
});

module.exports = router;
