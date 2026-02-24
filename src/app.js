const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// 1. SERVE THE UI: This makes http://localhost:3000 show your HTML
app.use(express.static(path.join(__dirname, 'public')));

// --- DYNAMIC API ROUTES ---

// Mock Database (Data stays here while the server is running)
let cart = [];

// 2. LOGIN LOGIC
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password123') {
        res.status(200).send({ message: "Login Successful" });
    } else {
        res.status(401).send({ message: "Invalid Credentials" });
    }
});

// 3. CART LOGIC
app.post('/api/cart', (req, res) => {
    const { item } = req.body;
    cart.push(item);
    console.log("Current Cart:", cart); // See it in your terminal
    res.status(201).send({ message: "Item added", currentCart: cart });
});

app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));