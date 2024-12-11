const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan'
};

router.post('/admin-login', async (req, res) => {
    try {
        console.log('Admin login attempt received:', req.body);
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Username and password are required'
            });
        }

        let connection;
        try {
            connection = await mysql.createConnection(dbConfig);
            
            // Convert values to strings for comparison
            const sanitizedUsername = String(username).trim();
            const sanitizedPassword = String(password).trim();
            
            console.log('Sanitized credentials:', {
                username: sanitizedUsername,
                password: sanitizedPassword
            });

            const [rows] = await connection.execute(
                'SELECT * FROM admin_users WHERE username = ? AND password = ?',
                [sanitizedUsername, sanitizedPassword]
            );

            console.log('Database response:', rows);

            if (!rows || rows.length === 0) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid administrator credentials'
                });
            }

            const admin = rows[0];
            console.log('Found admin:', admin);

            // Set session
            req.session.admin_id = admin.id;
            req.session.username = admin.username;
            req.session.isAdmin = true;

            // Save session explicitly
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).json({
                        status: 'error',
                        message: 'Session error occurred'
                    });
                }

                console.log('Session saved successfully:', req.session);
                return res.json({
                    status: 'success',
                    message: 'Admin login successful',
                    redirectUrl: '/admindashboard'
                });
            });

        } finally {
            if (connection) {
                await connection.end();
            }
        }

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error occurred'
        });
    }
});

// The rest of your code remains the same...
module.exports = router;