const express = require('express');
const db = require('../../public/database/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Passenger Dashboard Endpoint
router.get('/passenger-dashboard', auth, async (req, res) => {
    const userId = req.session.user_id;

    try {
        // Fetch user data (name, email)
        const [userRows] = await db.promise().query(
            'SELECT name, email FROM users WHERE user_id = ?',
            [userId]
        );
        if (userRows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'User data not found.' });
        }
        const userData = userRows[0];

        // Fetch available rides
        const [rideRows] = await db.promise().query(
            'SELECT ride_id, start_location, end_location, status, time_range, waiting_time FROM rides WHERE status IN ("scheduled", "loading")'
        );
        const rides = rideRows || [];

        // Fetch payment history
        const [paymentRows] = await db.promise().query(
            'SELECT ride_id, amount, payment_method, status FROM payments WHERE user_id = ?',
            [userId]
        );
        const payments = paymentRows || [];

        // Combine data into a single response
        const response = {
            status: 'success',
            user: userData,
            rides,
            payments,
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
});

module.exports = router;
