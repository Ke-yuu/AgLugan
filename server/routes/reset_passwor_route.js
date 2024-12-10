const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../../public/database/db'); // Database connection
const router = express.Router();

router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ status: 'error', message: 'Invalid input.' });
    }

    try {
        // Verify the token
        const [tokenRows] = await db.promise().query(
            'SELECT user_id, expires_at FROM password_resets WHERE token = ?',
            [token]
        );

        if (tokenRows.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Invalid or expired token.' });
        }

        const resetData = tokenRows[0];

        // Check if the token has expired
        if (new Date(resetData.expires_at) < new Date()) {
            return res.status(400).json({ status: 'error', message: 'The token has expired.' });
        }

        // Hash the new password
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        // Update the user's password
        const [updateResult] = await db.promise().query(
            'UPDATE users SET password_hash = ? WHERE user_id = ?',
            [hashedPassword, resetData.user_id]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(500).json({ status: 'error', message: 'Failed to reset password.' });
        }

        // Delete the token after a successful password reset
        await db.promise().query('DELETE FROM password_resets WHERE token = ?', [token]);

        res.json({ status: 'success', message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
});

module.exports = router;
