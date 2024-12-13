const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();
const { isAdminLoggedIn } = require('../middleware/adminMiddleware'); 

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan',
};

router.use(isAdminLoggedIn);

router.get('/vusers', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const searchQuery = req.query.search ? `%${req.query.search}%` : null;

        let query = `
            SELECT 
                user_id,
                name,
                username,
                email,
                user_type,
                phone_number,
                id_number
            FROM users
        `;

        let params = [];

        if (searchQuery) {
            query += ` WHERE 
                name LIKE ? OR 
                email LIKE ? OR 
                user_type LIKE ?
            `;
            params = [searchQuery, searchQuery, searchQuery];
        }

        const [users] = await connection.execute(query, params);
        console.log('Backend - First user data:', users[0]);

        await connection.end();
        res.json(users);

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
