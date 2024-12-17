const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

// Direct database configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan',
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to the MySQL database.');
    }
});

router.get('/session-check', (req, res) => {
    if (req.session && req.session.user_id) {
        res.json({ success: true, message: 'Session active', user: req.session.username });
    } else {
        res.status(401).json({ success: false, message: 'Session expired' });
    }
});

router.post('/book-ride', async (req, res) => {
    console.log('Session on book-ride:', req.session); // Log session for debugging

    if (!req.session || !req.session.user_id) {
        console.log('Unauthorized access - session not found.');
        return res.status(401).json({ status: 'error', message: 'Unauthorized access' });
    }

    const { ride_id } = req.body;

    if (!ride_id) {
        return res.status(400).json({ status: 'error', message: 'Ride ID is required.' });
    }

    try {
        const [result] = await db.promise().query(
            `UPDATE rides 
             SET user_id = ?, booking_status = 'Booked' 
             WHERE ride_id = ? AND booking_status = 'Available'`,
            [req.session.user_id, ride_id]
        );

        if (result.affectedRows === 1) {
            res.json({ success: true, message: 'Ride booked successfully.' });
        } else {
            res.status(400).json({
                success: false,
                message: 'Ride is no longer available or already booked.',
            });
        }
    } catch (error) {
        console.error('Error booking ride:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
});

module.exports = router;