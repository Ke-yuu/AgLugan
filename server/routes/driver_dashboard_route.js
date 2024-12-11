const express = require('express');
const router = express.Router();
const db = require('../../client/public/database/db'); // Ensure you have a database connection setup in `db.js`
const auth = require('../middleware/auth'); 

// Get Driver Dashboard Data
router.get('/driver-dashboard', async (req, res) => {
    try {
        const [driver] = await db.query(`
            SELECT user_id, name FROM users WHERE user_type = 'Driver' LIMIT 1
        `);

        const [queuedRides] = await db.query(`
            SELECT * FROM ride_queue WHERE driver_id = ? AND status = 'Queued'
        `, [driver[0].id]);

        const [ongoingQueue] = await db.query(`
            SELECT * FROM ride_queue WHERE driver_id = ? AND status = 'Ongoing'
        `, [driver[0].id]);

        const [completedRides] = await db.query(`
            SELECT * FROM rides WHERE driver_id = ? AND status = 'Scheduled'
        `, [driver[0].id]);

        const [performance] = await db.query(`
            SELECT * FROM driver_performance WHERE driver_id = ?
        `, [driver[0].id]);

        res.json({
            name: driver[0].name,
            queuedRides,
            ongoingQueue,
            completedRides,
            performance: performance[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching driver dashboard data.');
    }
});

router.get('/driver-dashboard/getCurrent', async (req, res) => {
    try {
        if (!req.session || !req.session.user_id) {
            return res.status(401).json({ error: 'Not logged in' });
        }

        const [user] = await db.query(
            `SELECT user_id, name FROM users WHERE user_id = ?`,
            [req.session.user_id]
        );

        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user[0]);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error fetching user data.');
    }
});

// Queue a Ride
router.post('/driver-dashboard/queue', async (req, res) => {
    const { driver_id, vehicle_id, start_location, end_location } = req.body;

    try {
        await db.query(`
            INSERT INTO ride_queue (driver_id, vehicle_id, start_location, end_location, status)
            VALUES (?, ?, ?, ?, 'Queued')
        `, [driver_id, vehicle_id, start_location, end_location]);

        res.status(201).send('Ride queued successfully.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error queuing the ride.');
    }
});

// Cancel a Ride
router.patch('/driver-dashboard/cancel/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query(`
            UPDATE ride_queue SET status = 'Cancelled', cancel_time = NOW() WHERE queue_id = ?
        `, [id]);

        res.send('Ride cancelled successfully.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error cancelling the ride.');
    }
});

// Add a Vehicle
router.post('/driver-dashboard/vehicles', async (req, res) => {
    const { driver_id, capacity, plate_number } = req.body;

    // Validate inputs
    if (!driver_id || !capacity || !plate_number) {
        return res.status(400).send('All fields are required.');
    }

    try {
        // Insert vehicle into the database
        await db.query(
            `
            INSERT INTO vehicles (driver_id, capacity, plate_number)
            VALUES (?, ?, ?)
            `,
            [driver_id, capacity, plate_number]
        );

        res.status(201).send('Vehicle added successfully.');
    } catch (error) {
        console.error('Error adding vehicle:', error);
        res.status(500).send('Error adding the vehicle.');
    }
});

// Get Vehicles for the Authenticated Driver
router.get('/driver-dashboard/getVehicles', auth, async (req, res) => {

    console.log('Driver ID:', req.driver_id);
    try {
        const [vehicles] = await db.query(
            `SELECT vehicle_id, plate_number FROM vehicles WHERE driver_id = ?`,
            [req.driver_id]
        );

        res.json(vehicles);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).send('Error fetching vehicles.');
    }
});

module.exports = router;
