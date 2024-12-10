const express = require('express');
const router = express.Router();
const db = require('../../public/database/db'); // Database connection

router.post('/payment-process', async (req, res) => {
    const userId = req.session.user_id;
    const userType = (req.session.user_type || 'student').toLowerCase();

    if (!userId) {
        return res.status(401).json({ status: 'error', message: 'User not logged in.' });
    }

    const {
        payment_method = '',
        ride_id = null,
        status = 'scheduled',
        gcash_number = '',
        maya_number = '',
    } = req.body;

    try {
        // Calculate the total amount based on user type and ride status
        let totalAmount = userType === 'faculty/staff' ? 15 : 13;
        if (status.toLowerCase() === 'scheduled') {
            totalAmount += 5;
        }

        // Determine phone number for GCash or Maya payments
        let phoneNumber = null;
        if (payment_method === 'gcash') {
            phoneNumber = gcash_number;
        } else if (payment_method === 'maya') {
            phoneNumber = maya_number;
        }

        // Validate mobile number for non-cash methods
        if ((payment_method === 'gcash' || payment_method === 'maya') && !/^09\d{9}$/.test(phoneNumber)) {
            return res.status(400).json({
                status: 'error',
                message: "Invalid mobile number. Must start with '09' and be followed by 9 digits.",
            });
        }

        // Validate required fields
        if ((payment_method === 'gcash' || payment_method === 'maya') && (!totalAmount || !phoneNumber)) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields.',
            });
        }

        // Insert payment into 'payments' table
        let query;
        let params;
        if (payment_method === 'cash') {
            query = `
                INSERT INTO payments (ride_id, amount, payment_method, user_id, status)
                VALUES (?, ?, ?, ?, 'pending')
            `;
            params = [ride_id, totalAmount, payment_method, userId];
        } else {
            query = `
                INSERT INTO payments (ride_id, amount, payment_method, phone_number, user_id, status)
                VALUES (?, ?, ?, ?, ?, 'pending')
            `;
            params = [ride_id, totalAmount, payment_method, phoneNumber, userId];
        }

        const [result] = await db.promise().query(query, params);

        if (result.affectedRows === 1) {
            return res.json({ status: 'success', message: 'Payment submitted successfully!' });
        } else {
            return res.status(500).json({ status: 'error', message: 'Failed to submit payment.' });
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
});

module.exports = router;
