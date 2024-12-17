const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan',
};

// Fetch rides
router.get('/rides', async (req, res) => {
    const { route = '', status = '', time = '', show_inactive = 'false' } = req.query;

    try {
        const connection = await mysql.createConnection(dbConfig);

        let sql = `
            SELECT rides.ride_id, rides.start_location, rides.end_location, rides.status, 
                rides.fare, rides.waiting_time, rides.time_range, rides.plate_number
            FROM rides
            WHERE 1=1
        `;

        const params = [];

        if (route) {
            const [startLocation, endLocation] = route.split('-').map(r => r.trim());
            sql += ` AND rides.start_location = ? AND rides.end_location = ?`;
            params.push(startLocation, endLocation);
        }

        if (status) {
            sql += ` AND LOWER(rides.status) = ?`;
            params.push(status.toLowerCase());
        }

        if (time) {
            sql += ` AND rides.time_range LIKE ?`;
            params.push(`%${time}%`);
        }

        if (show_inactive !== 'true') {
            sql += ` AND LOWER(rides.status) != 'inactive'`;
        }

        const [rows] = await connection.execute(sql, params);
        await connection.end();

        res.json(rows);
    } catch (error) {
        console.error('Error fetching rides:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
