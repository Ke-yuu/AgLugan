const express = require('express');
const mysql = require('mysql2/promise'); // Using mysql2 for database connection
const router = express.Router();

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan',
};

// Route to update ride status
router.post('/update-ride-status', async (req, res) => {
    const { ride_id, status } = req.body;

    // Validate input
    if (!ride_id || !status) {
        return res.status(400).json({ success: false, message: 'Invalid input: ride_id or status is missing.' });
    }

    const validStatuses = ['Scheduled', 'Loading', 'Inactive'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    try {
        // Create a connection to the database
        const connection = await mysql.createConnection(dbConfig);

        try {
            // Check if the ride exists
            const [rideRows] = await connection.execute(
                'SELECT status FROM rides WHERE ride_id = ?',
                [ride_id]
            );

            if (rideRows.length === 0) {
                return res.status(404).json({ success: false, message: 'Ride not found.' });
            }

            // Check if the status is already up-to-date
            if (rideRows[0].status === status) {
                return res.json({ success: true, message: 'Status is already up-to-date. No changes made.' });
            }

            // Update the ride status
            const [updateResult] = await connection.execute(
                'UPDATE rides SET status = ? WHERE ride_id = ?',
                [status, ride_id]
            );

            if (updateResult.affectedRows > 0) {
                res.json({ success: true, message: 'Ride status updated successfully.' });
            } else {
                res.status(400).json({ success: false, message: 'Failed to update ride status. Please try again.' });
            }
        } finally {
            // Close the database connection
            await connection.end();
        }
    } catch (error) {
        console.error('Error updating ride status:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

module.exports = router;
