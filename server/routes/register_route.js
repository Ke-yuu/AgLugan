const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan',
};
const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, username, email, password, phone_number, user_type = 'Passenger' } = req.body;

    if (!name || !username || !email || !password || !phone_number) {
        return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }

    const validUserTypes = ['Passenger', 'Driver'];
    const userType = validUserTypes.includes(user_type) ? user_type : 'Passenger';

    try {
        const connection = await mysql.createConnection(dbConfig);

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await connection.execute(
            'INSERT INTO users (name, username, email, password_hash, phone_number, user_type) VALUES (?, ?, ?, ?, ?, ?)',
            [name, username, email, hashedPassword, phone_number, userType]
        );

        await connection.end();

        if (result.affectedRows === 1) {
            res.json({ status: 'success', message: 'Registration successful' });
        } else {
            res.status(500).json({ status: 'error', message: 'Error registering user.' });
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ status: 'error', message: 'Server error during registration.' });
    }
});

module.exports = router;