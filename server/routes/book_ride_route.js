const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

// Database configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan',
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to the MySQL database.');
    }
});

// Booking endpoint
router.post('/direct-booking', (req, res) => {
    const { ride_id } = req.body;

    if (!ride_id) {
        return res.status(400).json({
            success: false,
            message: 'Ride ID is required'
        });
    }

    // First check ride availability
    db.query(
        'SELECT * FROM rides WHERE ride_id = ? AND status = "In queue"',
        [ride_id],
        (error, rideResults) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Database error occurred'
                });
            }

            if (rideResults.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Ride not available for booking'
                });
            }

            const ride = rideResults[0];
            const currentSeats = parseInt(ride.seat_status) || 0;

            if (currentSeats >= 23) {
                return res.status(400).json({
                    success: false,
                    message: 'No seats available on this ride'
                });
            }

            // Start transaction for booking
            db.beginTransaction((err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Transaction error'
                    });
                }

                // Update seat status
                db.query(
                    'UPDATE rides SET seat_status = seat_status + 1 WHERE ride_id = ?',
                    [ride_id],
                    (updateError) => {
                        if (updateError) {
                            return db.rollback(() => {
                                res.status(500).json({
                                    success: false,
                                    message: 'Failed to update ride'
                                });
                            });
                        }

                        // Create booking record
                        db.query(
                            'INSERT INTO bookings (ride_id, booking_status, created_at) VALUES (?, "BOOKED", NOW())',
                            [ride_id],
                            (bookingError, bookingResult) => {
                                if (bookingError) {
                                    return db.rollback(() => {
                                        res.status(500).json({
                                            success: false,
                                            message: 'Failed to create booking'
                                        });
                                    });
                                }

                                // Commit transaction
                                db.commit((commitError) => {
                                    if (commitError) {
                                        return db.rollback(() => {
                                            res.status(500).json({
                                                success: false,
                                                message: 'Failed to commit transaction'
                                            });
                                        });
                                    }

                                    res.json({
                                        success: true,
                                        message: 'Booking successful',
                                        booking_id: bookingResult.insertId
                                    });
                                });
                            }
                        );
                    }
                );
            });
        }
    );
});

module.exports = router;