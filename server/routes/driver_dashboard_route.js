const express = require('express');
const router = express.Router();
const db = require('../../client/public/database/db'); // Ensure you have a database connection setup in `db.js`
const auth = require('../middleware/auth');

// Get Driver Dashboard Data
router.get('/driver-dashboard', async (req, res) => {
    try {
        if (!req.session || !req.session.user_id) {
            return res.status(401).json({ error: 'Not logged in' });
        }

        const driverId = req.session.user_id;
        console.log('Driver ID:', driverId);

        // Fetch driver details
        const [driver] = await db.query(
            `SELECT user_id, name FROM users WHERE user_id = ?`,
            [driverId]
        );

        if (driver.length === 0) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        // Fetch queued rides (status = 'Loading')
        const [queuedRides] = await db.query(
            `SELECT * FROM rides WHERE driver_id = ? AND status = 'Loading'`,
            [driverId]
        );

        // Fetch ongoing rides (status = 'Scheduled')
        const [ongoingQueue] = await db.query(
            `SELECT * FROM rides WHERE driver_id = ? AND status = 'Scheduled'`,
            [driverId]
        );

        // Fetch completed rides (status = 'Inactive')
        const [completedRides] = await db.query(
            `SELECT * FROM rides WHERE driver_id = ? AND status = 'Inactive'`,
            [driverId]
        );

        // Return response
        res.json({
            name: driver[0].name,
            queuedRides,
            ongoingQueue,
            completedRides,
        });
    } catch (error) {
        console.error('Error fetching driver dashboard data:', error);
        res.status(500).send('Error fetching driver dashboard data.');
    }
});

// Get Current Driver Data
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
    const { driver_id, vehicle_id, start_location, end_location, type, schedule_times, schedule_time } = req.body;

    try {
        // Fetch the plate_number from vehicles table
        const [vehicle] = await db.query(
            `SELECT plate_number FROM vehicles WHERE vehicle_id = ?`,
            [vehicle_id]
        );

        if (!vehicle || vehicle.length === 0) {
            return res.status(400).send('Invalid vehicle selected.');
        }

        const plate_number = vehicle[0].plate_number;

        if (type === 'now') {
            // Check if a "now" ride is already queued
            const [existingNowRides] = await db.query(
                `SELECT * FROM rides WHERE driver_id = ? AND status = 'Loading'`,
                [driver_id]
            );
            if (existingNowRides.length > 0) {
                return res.status(400).send('You already have an active "now" ride.');
            }
        
            // Queue a single "now" ride
            await db.query(
                `INSERT INTO rides (ride_id, driver_id, start_location, end_location, status, fare, waiting_time, time_range) 
                 VALUES (?, ?, ?, ?, 'Loading', ?, ?, '')`,
                [
                    plate_number,    // ride_id
                    driver_id,       // driver_id
                    start_location,  // start_location
                    end_location,    // end_location
                    0,               // fare
                    '00:00:00'       // waiting_time
                ]
            );
        
        } else if (type === 'scheduled') {
            if (!schedule_times && !schedule_time) {
                return res.status(400).send('A schedule time is required for scheduled rides.');
            }
        
            // Convert single schedule_time to an array for consistency
            const times = schedule_times || [schedule_time];
        
            // Queue the scheduled rides
            const queries = times.map((time) =>
                db.query(
                    `INSERT INTO rides (ride_id, driver_id, start_location, end_location, status, fare, waiting_time, time_range) 
                     VALUES (?, ?, ?, ?, 'Scheduled', ?, ?, ?)`,
                    [
                        plate_number,    // ride_id
                        driver_id,       // driver_id
                        start_location,  // start_location
                        end_location,    // end_location
                        0,               // Placeholder fare for "scheduled" rides
                        '00:20:00',      // Default waiting time
                        time             // time_range
                    ]
                )
            );
            await Promise.all(queries);
        }        

        res.status(201).send('Ride(s) queued successfully.');
    } catch (error) {
        console.error('Error queuing the ride:', error);
        res.status(500).send('Error queuing the ride.');
    }
});

router.get('/api/driver-dashboard/getQueuedRides', async (req, res) => {
    try {
        const [rides] = await db.query(
            `SELECT r.ride_id, r.start_location, r.end_location, r.status, r.time_range 
             FROM rides r
             WHERE r.status IN ('Loading', 'Scheduled')`
        );

        res.status(200).json(rides);
    } catch (error) {
        console.error('Error fetching queued rides:', error);
        res.status(500).send('Error fetching queued rides.');
    }
});





// Add a Vehicle
router.post('/driver-dashboard/vehicles', async (req, res) => {
    const { driver_id, capacity, plate_number } = req.body;

    if (!driver_id || !capacity || !plate_number) {
        return res.status(400).send('All fields are required.');
    }

    try {
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
