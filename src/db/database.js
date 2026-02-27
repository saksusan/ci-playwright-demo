const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'shop.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      username  TEXT    NOT NULL UNIQUE,
      email     TEXT    NOT NULL UNIQUE,
      password  TEXT    NOT NULL,
      role      TEXT    NOT NULL DEFAULT 'customer',
      created_at TEXT   DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      name  TEXT    NOT NULL UNIQUE,
      slug  TEXT    NOT NULL UNIQUE,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT,
      price       REAL    NOT NULL,
      stock       INTEGER NOT NULL DEFAULT 0,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      image_url   TEXT,
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT    NOT NULL,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity   INTEGER NOT NULL DEFAULT 1,
      added_at   TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status     TEXT    NOT NULL DEFAULT 'pending',
      total      REAL    NOT NULL DEFAULT 0,
      created_at TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity   INTEGER NOT NULL,
      unit_price REAL    NOT NULL
    );
  `);

    // Seed categories if empty
    const catCount = db.prepare('SELECT COUNT(*) as n FROM categories').get().n;
    if (catCount === 0) {
        const insertCat = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)');
        insertCat.run('Electronics', 'electronics', 'Gadgets, devices, and tech accessories');
        insertCat.run('Clothing', 'clothing', 'Men and women fashion');
        insertCat.run('Books', 'books', 'Fiction, non-fiction, and educational');
        insertCat.run('Home & Garden', 'home-garden', 'Furniture, decor, and garden supplies');

        // Seed products
        const insertProd = db.prepare(`
      INSERT INTO products (name, description, price, stock, category_id, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        insertProd.run('Wireless Headphones', 'Premium noise-cancelling over-ear headphones', 129.99, 50, 1, 'https://placehold.co/400x300?text=Headphones');
        insertProd.run('Mechanical Keyboard', 'Compact TKL mechanical keyboard with RGB lighting', 89.99, 30, 1, 'https://placehold.co/400x300?text=Keyboard');
        insertProd.run('USB-C Hub', '7-in-1 USB-C hub with HDMI, USB 3.0 and PD charging', 39.99, 100, 1, 'https://placehold.co/400x300?text=USB+Hub');
        insertProd.run('Classic White Tee', '100% organic cotton unisex t-shirt', 24.99, 200, 2, 'https://placehold.co/400x300?text=T-Shirt');
        insertProd.run('Denim Jacket', 'Slim-fit blue denim jacket', 59.99, 75, 2, 'https://placehold.co/400x300?text=Jacket');
        insertProd.run('The Art of Code', 'A journey through elegant software design patterns', 34.99, 150, 3, 'https://placehold.co/400x300?text=Book');
        insertProd.run('Clean Architecture', 'Practical guide to sustainable software systems', 44.99, 80, 3, 'https://placehold.co/400x300?text=Book');
        insertProd.run('Bamboo Desk Organizer', 'Eco-friendly 5-slot bamboo desk organizer', 19.99, 60, 4, 'https://placehold.co/400x300?text=Organizer');

        console.log('✅ Database seeded with sample categories and products');
    }
}

module.exports = { db, initializeDatabase };
