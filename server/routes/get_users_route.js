const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan',
};

router.get('/vusers', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const query = 'SELECT user_id, name, username, email, user_type FROM users';
        const [rows] = await connection.execute(query);
        await connection.end();

        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'An error occurred while fetching users' });
    }
});

module.exports = router;