const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Product category management
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all product categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/', (req, res) => {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json(categories);
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sports
 *               slug:
 *                 type: string
 *                 example: sports
 *               description:
 *                 type: string
 *                 example: Sports equipment and accessories
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Validation error
 */
router.post('/', (req, res) => {
    const { name, slug, description } = req.body;
    if (!name || !slug) {
        return res.status(400).json({ error: 'name and slug are required' });
    }
    try {
        const stmt = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)');
        const result = stmt.run(name, slug, description || null);
        res.status(201).json({ message: 'Category created', categoryId: result.lastInsertRowid });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Category name or slug already exists' });
        }
        res.status(500).json({ error: 'Failed to create category', details: err.message });
    }
});

module.exports = router;
