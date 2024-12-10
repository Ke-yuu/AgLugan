const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../../public/database/db'); // Import database connection
const auth = require('../middleware/auth'); // Middleware to check user authentication
const router = express.Router();

router.post('/change-password', auth, async (req, res) => {
    const { current_password, new_password } = req.body;
    const userId = req.session.user_id;

    if (!current_password || !new_password) {
        return res.status(400).json({ success: false, message: 'Both current password and new password are required.' });
    }

    try {
        // Fetch current password hash from the database
        const [userRows] = await db.promise().query(
            'SELECT password_hash FROM users WHERE user_id = ?',
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const passwordHash = userRows[0].password_hash;

        // Verify current password
        const isPasswordCorrect = bcrypt.compareSync(current_password, passwordHash);
        if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
        }

        // Check if new password is different from the current password
        const isSamePassword = bcrypt.compareSync(new_password, passwordHash);
        if (isSamePassword) {
            return res.status(400).json({ success: false, message: 'New password must be different from the current password.' });
        }

        // Hash the new password
        const newPasswordHash = bcrypt.hashSync(new_password, 10);

        // Update the password in the database
        const [updateResult] = await db.promise().query(
            'UPDATE users SET password_hash = ? WHERE user_id = ?',
            [newPasswordHash, userId]
        );

        if (updateResult.affectedRows === 1) {
            res.json({ success: true, message: 'Password updated successfully.' });
        } else {
            res.status(500).json({ success: false, message: 'Error updating password.' });
        }
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

module.exports = router;
