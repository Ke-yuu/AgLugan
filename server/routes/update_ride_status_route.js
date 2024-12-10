const express = require('express');
const db = require('../../public/database/db'); // Database connection
const router = express.Router();

router.post('/update-ride-status', async (req, res) => {
    const { ride_id, status } = req.body;

    // Validate input
    if (!ride_id || !status) {
        console.error('Invalid input: ride_id or status missing');
        return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    const validStatuses = ['scheduled', 'loading', 'inactive'];
    if (!validStatuses.includes(status.toLowerCase())) {
        console.error('Invalid status value provided:', status);
        return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    try {
        // Check if the ride exists
        const [rideRows] = await db.promise().query(
            'SELECT status FROM rides WHERE ride_id = ?',
            [ride_id]
        );

        if (rideRows.length === 0) {
            console.error('Invalid ride ID: Ride not found - ride_id:', ride_id);
            return res.status(404).json({ success: false, message: 'Invalid ride ID: Ride not found' });
        }

        // Check if the status is already up-to-date
        if (rideRows[0].status.toLowerCase() === status.toLowerCase()) {
            return res.json({ success: true, message: 'Status is already up-to-date. No changes made.' });
        }

        // Update the ride status
        const [updateResult] = await db.promise().query(
            'UPDATE rides SET status = ? WHERE ride_id = ?',
            [status.toLowerCase(), ride_id]
        );

        if (updateResult.affectedRows > 0) {
            res.json({ success: true, message: 'Ride status updated successfully.' });
        } else {
            res.status(400).json({ success: false, message: 'No rows updated. Possibly invalid ride ID or no changes detected.' });
        }
    } catch (error) {
        console.error('Error updating ride status:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
