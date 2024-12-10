const express = require('express');
const db = require('../../public/database/db'); // Import database connection
const router = express.Router();

router.post('/check-unique', async (req, res) => {
    const { email, phone_number, username } = req.body;

    if (!email && !phone_number && !username) {
        return res.status(400).json({ status: 'error', message: 'No data provided to check uniqueness.' });
    }

    try {
        // Check email uniqueness
        let emailExists = false;
        if (email) {
            const [emailResult] = await db.promise().query('SELECT 1 FROM users WHERE email = ?', [email]);
            emailExists = emailResult.length > 0;
        }

        // Check phone number uniqueness
        let phoneExists = false;
        if (phone_number) {
            const [phoneResult] = await db.promise().query('SELECT 1 FROM users WHERE phone_number = ?', [phone_number]);
            phoneExists = phoneResult.length > 0;
        }

        // Check username uniqueness
        let usernameExists = false;
        if (username) {
            const [usernameResult] = await db.promise().query('SELECT 1 FROM users WHERE username = ?', [username]);
            usernameExists = usernameResult.length > 0;
        }

        res.json({
            email_exists: emailExists,
            phone_exists: phoneExists,
            username_exists: usernameExists,
        });
    } catch (error) {
        console.error('Error checking uniqueness:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
});

module.exports = router;
