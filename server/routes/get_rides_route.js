const express = require('express');
const mysql = require('mysql2/promise'); // Use mysql2 for promise-based queries
const router = express.Router();

// Database connection configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan',
};

// Get rides endpoint
router.get('/rides', async (req, res) => {
    const { route = '', status = '', time = '', show_inactive = 'false' } = req.query;

    try {
        const connection = await mysql.createConnection(dbConfig);

        try {
            // Base SQL query
            let sql = `
                SELECT rides.*, vehicles.plate_number
                FROM rides
                LEFT JOIN vehicles ON rides.driver_id = vehicles.driver_id
                WHERE 1=1
            `;

            // Apply route filter if provided
            if (route) {
                const routeParts = route.split('-');
                if (routeParts.length === 2) {
                    const startLocation = routeParts[0].trim();
                    const endLocation = routeParts[1].trim();
                    sql += ` AND start_location = ? AND end_location = ?`;
                }
            }

            // Apply status filter if provided
            if (status) {
                sql += ` AND LOWER(status) = ?`;
            }

            // Apply time filter if provided
            if (time) {
                sql += ` AND time_range LIKE ?`;
            }

            // Apply filter for inactive rides if `show_inactive` is not set to true
            if (show_inactive !== 'true') {
                sql += ` AND LOWER(status) != 'inactive'`;
            }

            // Prepare parameters for the query
            const params = [];
            if (route) {
                const routeParts = route.split('-');
                if (routeParts.length === 2) {
                    params.push(routeParts[0].trim(), routeParts[1].trim());
                }
            }
            if (status) {
                params.push(status.toLowerCase());
            }
            if (time) {
                params.push(`%${time}%`);
            }

            // Execute query
            const [rows] = await connection.execute(sql, params);

            // Respond with the query results
            res.json(rows || []);

        } catch (error) {
            console.error('Error fetching rides from database:', error);
            res.status(500).json({ error: 'Error fetching rides. Please try again later.' });
        } finally {
            await connection.end(); // Close the connection
        }

    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
});

module.exports = router;
