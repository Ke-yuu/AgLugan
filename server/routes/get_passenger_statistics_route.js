const express = require('express');
const db = require('../../public/database/db'); // Database connection
const router = express.Router();

router.get('/passenger-statistics', async (req, res) => {
    try {
        // Fetch data from the passenger_statistics table
        const [rows] = await db.promise().query(
            `SELECT day_of_week, time_slot, bookings_count
             FROM passenger_statistics
             ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), time_slot`
        );

        // Return the data as JSON
        res.json(rows);
    } catch (error) {
        console.error('Error fetching passenger statistics:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
