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
    const { vehicle_id, start_location, end_location, type, fare, schedule_times, schedule_time } = req.body;

    if (!req.session || !req.session.user_id) {
        return res.status(401).send('Not logged in.');
    }
    const driver_id = req.session.user_id;

    try {
        // Validate the vehicle belongs to the driver
        const [vehicle] = await db.query(
            `SELECT plate_number FROM vehicles WHERE vehicle_id = ? AND driver_id = ?`,
            [vehicle_id, driver_id]
        );

        if (!vehicle || vehicle.length === 0) {
            return res.status(400).send('Invalid vehicle selected.');
        }

        const plate_number = vehicle[0].plate_number;

        if (type === 'scheduled') {
            if (!schedule_times && !schedule_time) {
                return res.status(400).send('A schedule time is required for scheduled rides.');
            }

            // Build the schedule times array
            const times = schedule_times || [schedule_time];

            for (const time of times) {
                // Calculate start and end times with a 15-minute interval
                const startTime = new Date(time);
                const endTime = new Date(startTime);
                endTime.setMinutes(startTime.getMinutes() + 15); // Add 15 minutes

                // Format the time range as 'YYYY-MM-DD HH:MM-HH:MM'
                const formattedDate = startTime.toISOString().split('T')[0];
                const startFormatted = startTime.toTimeString().slice(0, 5); // HH:MM
                const endFormatted = endTime.toTimeString().slice(0, 5);     // HH:MM
                const timeRange = `${formattedDate} ${startFormatted}-${endFormatted}`;

                // Check for conflicts with the same time range
                const [conflict] = await db.query(
                    `SELECT * FROM rides 
                     WHERE driver_id = ? AND status = 'Scheduled' AND time_range = ?`,
                    [driver_id, timeRange]
                );

                if (conflict.length > 0) {
                    return res.status(400).send(`A ride already exists at the scheduled time: ${timeRange}`);
                }

                // Insert the ride if no conflicts
                await db.query(
                    `INSERT INTO rides (plate_number, driver_id, start_location, end_location, status, fare, waiting_time, time_range) 
                     VALUES (?, ?, ?, ?, 'Scheduled', ?, ?, ?)`,
                    [plate_number, driver_id, start_location, end_location, fare, '00:15:00', timeRange]
                );
            }
        } else if (type === 'now') {
            // Prevent duplicate "now" rides
            const [existingNowRides] = await db.query(
                `SELECT * FROM rides WHERE driver_id = ? AND status = 'In Queue'`,
                [driver_id]
            );

            if (existingNowRides.length > 0) {
                return res.status(400).send('You already have an active "now" ride.');
            }

            // Generate time range for "now" rides
            const timeRange = await getNextTimeRange();

            await db.query(
                `INSERT INTO rides (plate_number, driver_id, start_location, end_location, status, fare, waiting_time, time_range) 
                 VALUES (?, ?, ?, ?, 'In Queue', ?, ?, ?)`,
                [
                    plate_number,
                    driver_id,
                    start_location,
                    end_location,
                    fare,
                    '00:15:00',
                    timeRange
                ]
            );
        } else {
            return res.status(400).send('Invalid ride type specified.');
        }

        res.status(201).send('Ride(s) queued successfully.');
    } catch (error) {
        console.error('Error queuing the ride:', error);
        res.status(500).send('Error queuing the ride.');
    }
});



// Mark Ride as Done
router.patch('/driver-dashboard/rides/:id/done', async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).send('Invalid ride ID.');
    }

    try {
        // Ensure the ride is in the correct status
        const [ride] = await db.query(
            `SELECT * FROM rides WHERE ride_id = ? AND status IN ('In Queue', 'Scheduled')`,
            [id]
        );

        if (!ride || ride.length === 0) {
            return res.status(404).send('Ride not found or already marked as done.');
        }

        // Update the ride status to 'Done'
        await db.query(`UPDATE rides SET status = 'Done' WHERE ride_id = ?`, [id]);
        res.status(200).send('Ride status updated to Done.');
    } catch (error) {
        console.error('Error updating ride status to Done:', error);
        res.status(500).send('An internal server error occurred while updating the ride status.');
    }
});

// Cancel Ride
router.patch('/driver-dashboard/rides/:id/cancel', async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).send('Invalid ride ID.');
    }

    try {
        // Ensure the ride is in a cancellable status
        const [ride] = await db.query(
            `SELECT * FROM rides WHERE ride_id = ? AND status IN ('In Queue', 'Scheduled')`,
            [id]
        );

        if (!ride || ride.length === 0) {
            return res.status(404).send('Ride not found or cannot be canceled.');
        }

        // Update the ride status to 'Cancelled'
        await db.query(`UPDATE rides SET status = 'Cancelled' WHERE ride_id = ?`, [id]);
        res.status(200).send('Ride status updated to Cancelled.');
    } catch (error) {
        console.error('Error updating ride status to Cancelled:', error);
        res.status(500).send('An internal server error occurred while updating the ride status.');
    }
});

// Add a Vehicle
router.post('/driver-dashboard/vehicles', async (req, res) => {
    const { capacity, plate_number } = req.body;

    if (!req.session || !req.session.user_id) {
        return res.status(401).send('Not logged in.');
    }

    const driver_id = req.session.user_id;

    if (!capacity || !plate_number) {
        return res.status(400).send('All fields are required.');
    }

    try {
        // Check if the plate number already exists for this driver
        const [existingVehicle] = await db.query(
            `SELECT * FROM vehicles WHERE driver_id = ? AND plate_number = ?`,
            [driver_id, plate_number]
        );

        if (existingVehicle.length > 0) {
            return res.status(400).send('This plate number is already registered to your account.');
        }

        // Add the vehicle if it's unique
        await db.query(
            `INSERT INTO vehicles (driver_id, capacity, plate_number) VALUES (?, ?, ?)`,
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
