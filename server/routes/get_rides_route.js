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
    const { route = '', status = '', time = '', show_inactive = 'false', search = '' } = req.query;

    try {
        const connection = await mysql.createConnection(dbConfig);

        let sql = `
            SELECT rides.ride_id, rides.start_location, rides.end_location, rides.status, 
                rides.fare, rides.waiting_time, rides.time_range, rides.plate_number
            FROM rides
            WHERE 1=1
        `;

        const params = [];

        // Filter by route (start_location and end_location)
        if (route) {
            const [startLocation, endLocation] = route.split('-').map(r => r.trim());
            sql += ` AND rides.start_location = ? AND rides.end_location = ?`;
            params.push(startLocation, endLocation);
        }

        // Filter by status
        if (status) {
            sql += ` AND LOWER(rides.status) = ?`;
            params.push(status.toLowerCase());
        }

        // Filter by time
        if (time) {
            sql += ` AND rides.time_range LIKE ?`;
            params.push(`%${time}%`);
        }

        // Ensure rides that are not inactive if show_inactive is not 'true'
        if (show_inactive !== 'true') {
            sql += ` AND LOWER(rides.status) != 'inactive'`;
        }

        // Add search functionality to search across specific fields, including ride_id
        if (search) {
            sql += ` AND (
                rides.ride_id LIKE ? OR 
                rides.start_location LIKE ? OR 
                rides.end_location LIKE ? OR 
                rides.status LIKE ? OR 
                rides.fare LIKE ? OR 
                rides.waiting_time LIKE ? OR 
                rides.time_range LIKE ? OR 
                rides.plate_number LIKE ?
            )`;
            const searchTerm = `%${search}%`; // Wrap search term with wildcards for partial matching
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Execute the query
        const [rows] = await connection.execute(sql, params);
        await connection.end();

        // Send the results back as JSON
        res.json(rows);
    } catch (error) {
        console.error('Error fetching rides:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
