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

        // Fetch queued rides (status = 'In Queue')
        const [queuedRides] = await db.query(
            `SELECT * FROM rides WHERE driver_id = ? AND status IN ('In Queue', 'Scheduled')`,
            [driverId]
        );

        // Fetch ongoing rides (status = 'Scheduled')
        const [ongoingQueue] = await db.query(
            `SELECT * FROM rides WHERE status = 'In Queue'`,
            [driverId]
        );

        // Fetch completed rides (status = 'Inactive')
        const [scheduledRides] = await db.query(
            `SELECT * FROM rides WHERE status = 'Scheduled'`,
            [driverId]
        );

        // Return response
        res.json({
            name: driver[0].name,
            queuedRides,
            ongoingQueue,
            scheduledRides,
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

const getNextTimeRange = async () => {
    // Fetch the latest queued ride with 'In Queue' or 'Scheduled' status
    const [latestRide] = await db.query(
        `SELECT time_range FROM rides WHERE status IN ('In Queue', 'Scheduled') ORDER BY time_range DESC LIMIT 1`
    );

    let nextStartTime;

    if (latestRide.length > 0 && latestRide[0].time_range) {
        // Extract the end time of the latest queued ride
        const latestEndTime = latestRide[0].time_range.split('-')[1];
        nextStartTime = new Date(`1970-01-01T${latestEndTime}`);
    } else {
        // If no existing rides, start from the current time rounded to the nearest 15 minutes
        const now = new Date();
        now.setSeconds(0, 0); // Reset seconds and milliseconds
        now.setMinutes(Math.floor(now.getMinutes() / 15) * 15); // Round down to nearest 15 minutes
        nextStartTime = now;
    }

    // Calculate the next 15-minute block
    const start = new Date(nextStartTime);
    const end = new Date(nextStartTime);
    end.setMinutes(start.getMinutes() + 15); // Add 15 minutes to start time

    // Format time range as "HH:MM-HH:MM"
    const formattedStart = start.toTimeString().slice(0, 5);
    const formattedEnd = end.toTimeString().slice(0, 5);

    return `${formattedStart}-${formattedEnd}`;
};

// Queue a Ride
router.post('/driver-dashboard/queue', async (req, res) => {
    const { driver_id, vehicle_id, start_location, end_location, type, fare, schedule_times, schedule_time } = req.body;

    try {
        const [vehicle] = await db.query(
            `SELECT plate_number FROM vehicles WHERE vehicle_id = ?`,
            [vehicle_id]
        );

        if (!vehicle || vehicle.length === 0) {
            return res.status(400).send('Invalid vehicle selected.');
        }

        const plate_number = vehicle[0].plate_number;

        if (type === 'now') {
            // Check for existing "now" ride
            const [existingNowRides] = await db.query(
                `SELECT * FROM rides WHERE driver_id = ? AND status = 'In Queue'`,
                [driver_id]
            );

            if (existingNowRides.length > 0) {
                return res.status(400).send('You already have an active "now" ride.');
            }

            // Generate the time range
            const timeRange = await getNextTimeRange();

            // Queue a single "now" ride
            await db.query(
                `INSERT INTO rides (plate_number, driver_id, start_location, end_location, status, fare, waiting_time, time_range) 
                 VALUES (?, ?, ?, ?, 'In Queue', ?, ?, ?)`,
                [
                    plate_number,
                    driver_id,
                    start_location,
                    end_location,
                    fare,              // Placeholder fare
                    '00:15:00',     // Waiting time (15 minutes for now rides)
                    timeRange       // Generated time range
                ]
            );
        } else if (type === 'scheduled') {
            if (!schedule_times && !schedule_time) {
                return res.status(400).send('A schedule time is required for scheduled rides.');
            }

            const times = schedule_times || [schedule_time];

            const queries = times.map((time) =>
                db.query(
                    `INSERT INTO rides (plate_number, driver_id, start_location, end_location, status, fare, waiting_time, time_range) 
                     VALUES (?, ?, ?, ?, 'Scheduled', ?, ?, ?)`,
                    [
                        plate_number,
                        driver_id,
                        start_location,
                        end_location,
                        fare,
                        '00:15:00',
                        `${time.slice(11, 16)}-${new Date(time).toTimeString().slice(0, 5)}`
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
