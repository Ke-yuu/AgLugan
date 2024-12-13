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

router.post('/admin-login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ status: 'error', message: 'Username and password are required.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM admin_users WHERE username = ?', [username]);

        if (rows.length === 0) {
            console.error('Username not found:', username);
            return res.status(401).json({ status: 'error', message: 'Invalid username or password.' });
        }

        const admin = rows[0];
        console.log('Admin data fetched from database:', admin);

        // Compare password with hash
        const isPasswordMatch = await bcrypt.compare(password, admin.password);
        console.log('Password match status:', isPasswordMatch);

        if (!isPasswordMatch) {
            return res.status(401).json({ status: 'error', message: 'Invalid username or password.' });
        }

        // Set session
        req.session.isAdmin = true;
        req.session.adminId = admin.id;
        console.log('Session created:', req.session);

        res.json({ status: 'success', message: 'Login successful', redirectUrl: '/admindashboard' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
});

module.exports = router;


// Admin logout route
router.post('/admin-logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ status: 'error', message: 'Failed to log out' });
        }
        res.clearCookie('connect.sid');
        res.json({ status: 'success', message: 'Logged out successfully' });
    });
});

module.exports = router;
