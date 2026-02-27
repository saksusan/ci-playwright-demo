const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and checkout
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Checkout — create an order from the cart
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: Cart is empty
 */
router.post('/', (req, res) => {
    const sessionId = req.headers['x-session-id'] || 'default-session';
    const { user_id } = req.body;

    const cartItems = db.prepare(`
    SELECT ci.quantity, p.id AS product_id, p.price, p.stock, p.name
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.session_id = ?
  `).all(sessionId);

    if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty. Add items before checking out.' });
    }

    // Check stock availability
    for (const item of cartItems) {
        if (item.quantity > item.stock) {
            return res.status(400).json({ error: `Insufficient stock for "${item.name}". Available: ${item.stock}` });
        }
    }

    const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Use a transaction for atomicity
    const placeOrder = db.transaction(() => {
        const orderResult = db.prepare('INSERT INTO orders (user_id, status, total) VALUES (?, ?, ?)').run(user_id || null, 'pending', total);
        const orderId = orderResult.lastInsertRowid;

        const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)');
        const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

        for (const item of cartItems) {
            insertItem.run(orderId, item.product_id, item.quantity, item.price);
            updateStock.run(item.quantity, item.product_id);
        }

        // Clear the cart
        db.prepare('DELETE FROM cart_items WHERE session_id = ?').run(sessionId);

        return orderId;
    });

    const orderId = placeOrder();
    res.status(201).json({ message: 'Order placed successfully', orderId, total: parseFloat(total.toFixed(2)) });
});

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter orders by user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *         description: Filter orders by status
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/', (req, res) => {
    const { user_id, status } = req.query;
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (user_id) { sql += ' AND user_id = ?'; params.push(user_id); }
    if (status) { sql += ' AND status = ?'; params.push(status); }

    sql += ' ORDER BY created_at DESC';
    const orders = db.prepare(sql).all(...params);
    res.json(orders);
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order details including line items
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order with line items
 *       404:
 *         description: Order not found
 */
router.get('/:id', (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const items = db.prepare(`
    SELECT oi.id, oi.quantity, oi.unit_price,
           (oi.quantity * oi.unit_price) AS subtotal,
           p.name AS product_name, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `).all(req.params.id);

    res.json({ ...order, items });
});

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *                 example: shipped
 *     responses:
 *       200:
 *         description: Order status updated
 *       404:
 *         description: Order not found
 */
router.patch('/:id/status', (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'Order status updated', orderId: order.id, status });
});

module.exports = router;
