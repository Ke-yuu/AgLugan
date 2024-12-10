const express = require('express');
const db = require('../../public/database/db'); // Database connection
const router = express.Router();

router.post('/book-ride', async (req, res) => {
    // Check if the user is logged in
    const userId = req.session.user_id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not logged in.' });
    }

    const { ride_id } = req.body;

    if (!ride_id) {
        return res.status(400).json({ success: false, message: 'Ride ID is required.' });
    }

    try {
        // Update the ride status to "Booked" and link it to the user
        const [result] = await db.promise().query(
            `UPDATE rides 
             SET user_id = ?, booking_status = 'Booked' 
             WHERE ride_id = ? AND booking_status = 'Available'`,
            [userId, ride_id]
        );

        if (result.affectedRows === 1) {
            res.json({ success: true, message: 'Ride booked successfully.' });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to book ride. The ride may already be booked or unavailable.',
            });
        }
    } catch (error) {
        console.error('Error booking ride:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

module.exports = router;
