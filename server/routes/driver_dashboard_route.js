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

        // Calculate performance metrics
        const [driverPerformance] = await db.query(
            `SELECT * FROM driver_performance WHERE driver_id = ?`,
            [driverId]
        );

        let totalRides = 0;
        let completedRidesCount = completedRides.length;
        let cancelledRidesCount = driverPerformance.length > 0 ? driverPerformance[0].cancelled_rides : 0;
        totalRides = completedRidesCount + cancelledRidesCount;

        // Calculate total earnings
        let totalEarnings = 0;
        for (let ride of completedRides) {
            const [vehicle] = await db.query(
                `SELECT capacity FROM vehicles WHERE vehicle_id = ?`,
                [ride.vehicle_id]
            );
            const capacity = vehicle[0]?.capacity || 0;
            totalEarnings += ride.fare * capacity;
        }

        // Update performance table
        await db.query(
            `UPDATE driver_performance
             SET total_rides = ?, completed_rides = ?, total_earnings = ?, last_updated = NOW()
             WHERE driver_id = ?`,
            [totalRides, completedRidesCount, totalEarnings, driverId]
        );

        // Return response
        res.json({
            name: driver[0].name,
            queuedRides,
            ongoingQueue,
            completedRides,
            performance: {
                totalRides,
                completedRides: completedRidesCount,
                cancelledRides: cancelledRidesCount,
                totalEarnings,
                averageRating: driverPerformance.length > 0 ? driverPerformance[0].average_rating : null,
            },
        });
    } catch (error) {
        console.error('Error fetching driver dashboard data:', error);
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
    const { driver_id, vehicle_id, start_location, end_location, type, schedule_time } = req.body;

    try {
        // Determine the status based on the ride type
        const status = type === 'now' ? 'Loading' : 'Scheduled';

        // Calculate the time range for the schedule or set a default for "Now"
        let time_range = 'Immediate'; // Default for "Now"
        if (type === 'scheduled' && schedule_time) {
            const timeStart = new Date(schedule_time);
            const timeEnd = new Date(timeStart.getTime() + 30 * 60000); // Add 30 minutes
            time_range = `${timeStart.getHours()}:${String(timeStart.getMinutes()).padStart(2, '0')}-${timeEnd.getHours()}:${String(timeEnd.getMinutes()).padStart(2, '0')}`;
        }

        // Fetch the plate number of the selected vehicle
        const [vehicle] = await db.query(
            `SELECT plate_number FROM vehicles WHERE vehicle_id = ? AND driver_id = ?`,
            [vehicle_id, driver_id]
        );

        if (vehicle.length === 0) {
            return res.status(404).send('Vehicle not found for the driver.');
        }

        const plate_number = vehicle[0].plate_number;

        // Insert the new ride into the database
        await db.query(
            `
            INSERT INTO rides (ride_id, driver_id, start_location, end_location, status, queue_id, time_range, fare, waiting_time)
            VALUES (?, ?, ?, ?, ?, NOW(), ?, 13.00, '00:20:00')
            `,
            [plate_number, driver_id, start_location, end_location, status, time_range]
        );

        console.log(`Ride added to the database with status: ${status}`);

        // Only promote rides if the `type` is `scheduled`, not `now`
        if (type === 'scheduled') {
            // Check if there are any 'Scheduled' rides for this driver
            const [ongoingRides] = await db.query(
                `SELECT * FROM rides WHERE driver_id = ? AND status = 'Scheduled'`,
                [driver_id]
            );

            if (ongoingRides.length === 0) {
                console.log('Promoting the earliest queued ride to ongoing...');
                await db.query(
                    `
                    UPDATE rides
                    SET status = 'Scheduled'
                    WHERE driver_id = ? AND status = 'Loading'
                    ORDER BY queue_id ASC
                    LIMIT 1
                    `,
                    [driver_id]
                );
            }
        }

        res.status(201).send('Ride queued successfully.');
    } catch (error) {
        console.error('Error queuing the ride:', error);
        res.status(500).send('Error queuing the ride.');
    }
});




// Cancel a Ride
router.patch('/driver-dashboard/cancel/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch the ride details
        const [ride] = await db.query(`SELECT * FROM rides WHERE ride_id = ?`, [id]);

        if (ride.length === 0) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        const cancelledRide = ride[0];
        const { driver_id } = cancelledRide;

        // Remove the ride from the `rides` table
        await db.query(`DELETE FROM rides WHERE ride_id = ?`, [id]);

        // Update the ride's status to 'Cancelled'
        await db.query(`UPDATE rides SET status = 'Cancelled' WHERE ride_id = ?`, [id]);

        // Update the driver_performance table
        const [performance] = await db.query(
            `SELECT * FROM driver_performance WHERE driver_id = ?`,
            [driver_id]
        );

        if (performance.length > 0) {
            // Update existing performance record
            await db.query(
                `
                UPDATE driver_performance
                SET cancelled_rides = cancelled_rides + 1,
                    total_rides = total_rides + 1
                WHERE driver_id = ?
                `,
                [driver_id]
            );
        } else {
            // Insert a new performance record if it doesn't exist
            await db.query(
                `
                INSERT INTO driver_performance (driver_id, total_rides, completed_rides, cancelled_rides, total_earnings)
                VALUES (?, 1, 0, 1, 0)
                `,
                [driver_id]
            );
        }

        res.send('Ride cancelled successfully and performance updated.');
    } catch (error) {
        console.error('Error cancelling ride:', error);
        res.status(500).send('Error cancelling ride.');
    }
});



// Mark a Ride as Done
router.patch('/driver-dashboard/markDone/:id', async (req, res) => {
    const { id } = req.params; // ride_id from request
    try {
        // Fetch the ride details before deletion
        const [ride] = await db.query(`SELECT * FROM rides WHERE ride_id = ?`, [id]);

        if (ride.length === 0) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        const completedRide = ride[0];
        const { driver_id, fare } = completedRide;

        // Remove the ride from the `rides` table
        await db.query(`DELETE FROM rides WHERE ride_id = ?`, [id]);

        // Update the driver_performance table
        const [performance] = await db.query(
            `SELECT * FROM driver_performance WHERE driver_id = ?`,
            [driver_id]
        );

        if (performance.length > 0) {
            // Update existing performance
            await db.query(
                `
                UPDATE driver_performance
                SET completed_rides = completed_rides + 1,
                    total_earnings = total_earnings + ?
                WHERE driver_id = ?
                `,
                [fare, driver_id]
            );
        } else {
            // Insert new performance record
            await db.query(
                `
                INSERT INTO driver_performance (driver_id, total_rides, completed_rides, cancelled_rides, total_earnings)
                VALUES (?, 1, 1, 0, ?)
                `,
                [driver_id, fare]
            );
        }

        res.status(200).send('Ride marked as done and performance updated.');
    } catch (error) {
        console.error('Error marking ride as done:', error);
        res.status(500).send('Error marking ride as done.');
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
