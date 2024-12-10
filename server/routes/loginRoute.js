const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
const router = express.Router();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan'
};

// Serve the login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/src/html/login.html'));
});

// Login API endpoint
router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt received:', req.body);

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Username and password are required'
            });
        }

        const connection = await mysql.createConnection(dbConfig);

        try {
            console.log('Querying database for username:', username);

            const [rows] = await connection.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );

            console.log('Database response:', rows);

            if (rows.length === 0) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid username or password'
                });
            }

            const user = rows[0];

            // Compare with password_hash instead of password
            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            console.log('Password match result:', passwordMatch);

            if (passwordMatch) {
                // Set session
                req.session.user_id = user.user_id;
                req.session.username = user.username;
                req.session.user_type = user.user_type;

                console.log('Login successful, session:', req.session);

                return res.json({
                    status: 'success',
                    message: 'Login successful',
                    redirectUrl: user.user_type === 'Driver' ? '/driverDashboard' : '/passengerDashboard'
                });
            }

            return res.status(401).json({
                status: 'error',
                message: 'Invalid username or password'
            });

        } finally {
            await connection.end();
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error occurred'
        });
    }
});

router.get('/test', (req, res) => {
    res.json({ message: 'Test route is working!' });
});

module.exports = router;