const express = require('express');
const router = express.Router();

router.post('/payment-amount', (req, res) => {
    // Get user type from session, default to 'student' if not set
    const userType = (req.session.user_type || 'student').toLowerCase();

    // Get ride status from request body or session, default to 'scheduled'
    const status = (req.body.status || req.session.status || 'scheduled').toLowerCase();

    // Debugging: Log received data
    console.log('User Type:', userType);
    console.log('Ride Status:', status);

    let amount = 0;

    // Determine the amount based on user type and ride status
    if (status === 'scheduled') {
        console.log('Scheduled ride status detected.');
        if (userType === 'faculty/staff') {
            amount = 20;
        } else {
            amount = 18;
        }
    } else if (status === 'loading') {
        console.log('Loading ride status detected.');
        if (userType === 'faculty/staff') {
            amount = 15;
        } else {
            amount = 13;
        }
    } else {
        // Handle unexpected ride status
        console.error('Unexpected ride status:', status);
        return res.status(400).json({
            status: 'error',
            message: `Unexpected ride status value: ${status}`,
        });
    }

    // Debugging: Log the calculated amount
    console.log(`Calculated Amount for User Type '${userType}' and Status '${status}':`, amount);

    // Return the amount in JSON format
    res.json({
        status: 'success',
        amount,
        debug: {
            user_type: userType,
            status,
        },
    });
});

module.exports = router;
