const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const port = 3000;

/**
 * STEP 1: Connect to MySQL WITHOUT database
 * (because database may not exist yet)
 */
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'testdb-5.cnoieourr.ap-sou-1.rds.amazows.com',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || '56dsvdsv78'
});

/**
 * STEP 2: Connect
 */
db.connect((err) => {
    if (err) {
        console.error('MySQL connection failed:', err);
        process.exit(1);
    }
    console.log('MySQL Connected...');
});

/**
 * STEP 3: Create Database if not exists
 */
const DATABASE_NAME = process.env.DB_NAME || 'testdb_1';

db.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`, (err) => {
    if (err) throw err;
    console.log(`Database '${DATABASE_NAME}' ready`);

    // Use database
    db.changeUser({ database: DATABASE_NAME }, (err) => {
        if (err) throw err;
        console.log(`Using database '${DATABASE_NAME}'`);

        /**
         * STEP 4: Create Table if not exists
         */
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255)
        )`;

        db.query(createTableQuery, (err) => {
            if (err) throw err;
            console.log('Table "items" ready');
        });
    });
});

/**
 * ROUTES
 */

// Home
app.get('/', (req, res) => {
    res.send('CRUD App is running 🚀');
});

// Create item
app.post('/addItem', (req, res) => {
    const { name } = req.body;
    const sql = 'INSERT INTO items SET ?';

    db.query(sql, { name }, (err) => {
        if (err) throw err;
        res.send('Item added');
    });
});

// Read all items
app.get('/getItems', (req, res) => {
    db.query('SELECT * FROM items', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Update item
app.put('/updateItem/:id', (req, res) => {
    const sql = 'UPDATE items SET name=? WHERE id=?';

    db.query(sql, [req.body.name, req.params.id], (err) => {
        if (err) throw err;
        res.send('Item updated');
    });
});

// Delete item
app.delete('/deleteItem/:id', (req, res) => {
    const sql = 'DELETE FROM items WHERE id=?';

    db.query(sql, [req.params.id], (err) => {
        if (err) throw err;
        res.send('Item deleted');
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

