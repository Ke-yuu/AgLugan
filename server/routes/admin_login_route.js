const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const router = express.Router();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan'
};

// Middleware to check if admin is logged in
function isAdminLoggedIn(req, res, next) {
    if (req.session && req.session.isAdmin) {
        next();
    } else {
        res.status(401).json({ status: 'error', message: 'Unauthorized access' });
    }
}

// Admin Login Route
router.post('/admin-login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ status: 'error', message: 'Username and password are required.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM admin_users WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.status(401).json({ status: 'error', message: 'Invalid username or password.' });
        }

        const admin = rows[0];
        const isPasswordMatch = await bcrypt.compare(password, admin.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ status: 'error', message: 'Invalid username or password.' });
        }

        res.json({ status: 'success', message: 'Login successful', redirectUrl: '/admindashboard' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
});

module.exports = router;


// Admin logout route
router.post('/admin-logout', isAdminLoggedIn, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ status: 'error', message: 'Failed to log out' });
        }

        res.json({ status: 'success', message: 'Logged out successfully' });
    });
});

module.exports = router;
