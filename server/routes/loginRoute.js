const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const router = express.Router();

// Database connection configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan'
};

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows, fields] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length > 0) {
            const user = rows[0];
            if (user.password === password) {
                // Login successful
                req.session.user_id = user.user_id; 
                req.session.username = user.username;
                res.json({ status: 'success', message: 'Logged in successfully' });
            } else {
                res.json({ status: 'error', message: 'Invalid username or password' });
            }
        } else {
            res.json({ status: 'error', message: 'User not found' });
        }

        await connection.end();
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ status: 'error', message: 'Database error' });
    }
});

// Protected route example
router.get('/protected', (req, res) => {
    if (req.session.user_id) {
        res.json({ message: 'This is a protected route' });
    } else {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
});

// Serve the login page HTML (optional if you want to serve login.html directly)
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'src', 'html', 'login.html'));
});

module.exports = router;
