const express = require('express');
const mysql = require('mysql2/promise');
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan',
};

const router = express.Router();

router.post('/check-unique', async (req, res) => {
    const { email, phone_number, username } = req.body;

    if (!email && !phone_number && !username) {
        return res.status(400).json({ status: 'error', message: 'No data provided to check uniqueness.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        const [emailResult] = await connection.execute('SELECT 1 FROM users WHERE email = ?', [email]);
        const [phoneResult] = await connection.execute('SELECT 1 FROM users WHERE phone_number = ?', [phone_number]);
        const [usernameResult] = await connection.execute('SELECT 1 FROM users WHERE username = ?', [username]);

        await connection.end();

        res.json({
            email_exists: emailResult.length > 0,
            phone_exists: phoneResult.length > 0,
            username_exists: usernameResult.length > 0,
        });
    } catch (error) {
        console.error('Error checking uniqueness:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
});

module.exports = router;