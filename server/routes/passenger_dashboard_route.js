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
                : '/default-profile.png';

            // Fetch available rides
            const [rideRows] = await connection.execute(
                `SELECT ride_id, start_location, end_location, status, time_range, waiting_time 
                 FROM rides 
                 WHERE status IN ('scheduled', 'loading')`
            );

            // Fetch payment history
            const [paymentRows] = await connection.execute(
                `SELECT ride_id, amount, payment_method, status 
                 FROM payments 
                 WHERE user_id = ?`,
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

module.exports = router;
