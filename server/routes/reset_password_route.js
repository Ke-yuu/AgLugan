// reset_password_route.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mysql = require('mysql2');

// Database configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan'
});

// Verify token and get user
router.get('/verify-reset-token/:token', async (req, res) => {
    try {
        const [result] = await db.promise().query(
            'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()',
            [req.params.token]
        );

        if (result.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or expired token'
            });
        }

        res.json({ status: 'success' });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error verifying token'
        });
    }
});

// Handle password reset
router.post('/reset-password', async (req, res) => {
    console.log('Reset password request received:', req.body);
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({
            status: 'error',
            message: 'Token and new password are required'
        });
    }

    try {
        // Verify token and get user
        const [resetData] = await db.promise().query(
            'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()',
            [token]
        );

        if (resetData.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or expired token'
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        await db.promise().query(
            'UPDATE users SET password_hash = ? WHERE user_id = ?',
            [hashedPassword, resetData[0].user_id]
        );

        // Delete the used token
        await db.promise().query('DELETE FROM password_resets WHERE token = ?', [token]);

        res.json({
            status: 'success',
            message: 'Password has been reset successfully'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error resetting password'
        });
    }
});

module.exports = router;