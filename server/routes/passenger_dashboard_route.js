const express = require('express');
const mysql = require('mysql2/promise');
const auth = require('../middleware/auth');
const router = express.Router();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan',
};

// Passenger Dashboard Route
router.get('/passenger-dashboard', auth, async (req, res) => {
    const userId = req.session.user_id;

    if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized access.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        try {
            // Fetch user data including profile picture
            const [userRows] = await connection.execute(
                `SELECT name, email, profile_picture 
                 FROM users 
                 WHERE user_id = ?`,
                [userId]
            );

            if (userRows.length === 0) {
                return res.status(404).json({ status: 'error', message: 'User data not found.' });
            }

            const userData = userRows[0];

            // Ensure default values for missing fields
            const name = userData.name || 'Unknown';
            const email = userData.email || 'Not provided';
            const profile_picture_url = userData.profile_picture
                ? `${userData.profile_picture}`
                : './media/default-profile.png';

            // Fetch available rides
            const [rideRows] = await connection.execute(
                `SELECT ride_id, start_location, end_location, status, time_range, waiting_time 
                 FROM rides 
                 WHERE status IN ('Scheduled', 'In Queue')`
            );

            // Fetch payment history
            const [paymentRows] = await connection.execute(
                `SELECT ride_id, amount, payment_method, status, payment_date
                 FROM payments 
                 WHERE user_id = ? 
                 ORDER BY payment_date DESC`,
                [userId]
            );

            // Send combined data
            res.json({
                status: 'success',
                user: { name, email, profile_picture_url },
                rides: rideRows || [],
                payments: paymentRows || [],
            });
        } finally {
            await connection.end();
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
});

// Ride Details Route
router.get('/ride-details', auth, async (req, res) => {
    const { ride_id } = req.query;

    if (!ride_id) {
        return res.status(400).json({ status: 'error', message: 'Ride ID is required.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        try {
            const [rideRows] = await connection.execute(
                `SELECT 
                    r.ride_id, 
                    CONCAT(r.start_location, ' - ', r.end_location) AS route, 
                    r.time_range AS schedule, 
                    v.plate_number,
                    r.status
                 FROM rides r
                 LEFT JOIN vehicles v ON r.driver_id = v.driver_id
                 WHERE r.ride_id = ?`,
                [ride_id]
            );

            const [paymentRows] = await connection.execute(
                `SELECT amount, payment_method, status, payment_date 
                 FROM payments 
                 WHERE ride_id = ?`,
                [ride_id]
            );

            if (rideRows.length === 0 || paymentRows.length === 0) {
                return res.status(404).json({ status: 'error', message: 'Details not found.' });
            }

            res.json({
                status: 'success',
                ride: rideRows[0],
                payment: paymentRows[0],
            });
        } finally {
            await connection.end();
        }
    } catch (error) {
        console.error('Error fetching ride details:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
});

module.exports = router;
