const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog management
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products (with optional filters)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category slug (e.g. electronics)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', (req, res) => {
    const { category, search, minPrice, maxPrice } = req.query;

    let sql = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
    const params = [];

    if (category) {
        sql += ' AND c.slug = ?';
        params.push(category);
    }
    if (search) {
        sql += ' AND p.name LIKE ?';
        params.push(`%${search}%`);
    }
    if (minPrice) {
        sql += ' AND p.price >= ?';
        params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
        sql += ' AND p.price <= ?';
        params.push(parseFloat(maxPrice));
    }

    sql += ' ORDER BY p.created_at DESC';

    const products = db.prepare(sql).all(...params);
    res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:id', (req, res) => {
    const product = db.prepare(`
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(req.params.id);

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, stock]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gaming Mouse
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 example: 49.99
 *               stock:
 *                 type: integer
 *                 example: 100
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               image_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation error
 */
router.post('/', (req, res) => {
    const { name, description, price, stock, category_id, image_url } = req.body;
    if (!name || price == null || stock == null) {
        return res.status(400).json({ error: 'name, price, and stock are required' });
    }
    const stmt = db.prepare(`
    INSERT INTO products (name, description, price, stock, category_id, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
    const result = stmt.run(name, description || null, price, stock, category_id || null, image_url || null);
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Product created', product });
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *               image_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
router.put('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { name, description, price, stock, category_id, image_url } = req.body;
    const stmt = db.prepare(`
    UPDATE products
    SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, image_url = ?
    WHERE id = ?
  `);
    stmt.run(
        name ?? existing.name,
        description ?? existing.description,
        price ?? existing.price,
        stock ?? existing.stock,
        category_id ?? existing.category_id,
        image_url ?? existing.image_url,
        req.params.id
    );
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json({ message: 'Product updated', product: updated });
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.delete('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
});

module.exports = router;
