const express = require('express');
const db = require('../../public/database/db');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/update-profile', auth, async (req, res) => {
    const { name, email } = req.body;
    const userId = req.session.user_id;

    if (!name && !email) {
        return res.status(400).json({ success: false, message: 'No data to update.' });
    }

    const allowedDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'slu.edu.ph'];
    const updates = [];
    const params = [];

    try {
        // Prepare dynamic updates for SQL
        if (name) {
            updates.push('name = ?');
            params.push(name);
        }

        if (email) {
            const emailDomain = email.split('@')[1];
            if (!allowedDomains.includes(emailDomain)) {
                return res.status(400).json({ success: false, message: 'Invalid email domain.' });
            }

            // Check if the email is already in use by another user
            const [existingUsers] = await db.promise().query(
                'SELECT * FROM users WHERE email = ? AND user_id != ?',
                [email, userId]
            );

            if (existingUsers.length > 0) {
                return res.status(409).json({ success: false, message: 'The email address is already in use by another account.' });
            }

            updates.push('email = ?');
            params.push(email);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update.' });
        }

        // Add the user ID as the last parameter for the WHERE clause
        const query = `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`;
        params.push(userId);

        // Execute the update query
        const [result] = await db.promise().query(query, params);

        if (result.affectedRows === 1) {
            res.json({ success: true, message: 'Profile updated successfully.' });
        } else {
            res.status(500).json({ success: false, message: 'Error updating profile.' });
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
