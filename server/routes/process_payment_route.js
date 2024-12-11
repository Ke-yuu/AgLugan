const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan'
};

const db = mysql.createPool(dbConfig);

router.post('/payment-process', async (req, res) => {
    console.log('Payment process request received:', req.body);
    try {
        const userId = req.session.user_id;
        if (!userId) {
            return res.status(401).json({ 
                status: 'error', 
                message: 'User not logged in.' 
            });
        }

        const {
            payment_method,
            ride_id,
            amount,
            gcash_number,
            maya_number
        } = req.body;

        // Validate required fields
        if (!payment_method) {
            return res.status(400).json({
                status: 'error',
                message: 'Payment method is required'
            });
        }

        // Get phone number based on payment method
        let phoneNumber = '0';
        if (payment_method.toLowerCase() === 'gcash') {
            phoneNumber = gcash_number || '0';
        } else if (payment_method.toLowerCase() === 'maya') {
            phoneNumber = maya_number || '0';
        }

        // Validate phone number format if it's a digital payment
        if ((payment_method.toLowerCase() === 'gcash' || payment_method.toLowerCase() === 'maya') && 
            phoneNumber !== '0') {
            if (!/^09\d{9}$/.test(phoneNumber)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid phone number format'
                });
            }
        }

        try {
            // Insert payment record
            const [result] = await db.promise().query(
                `INSERT INTO payments 
                (ride_id, amount, payment_method, status, phone_number, user_id) 
                VALUES (?, ?, ?, 'pending', ?, ?)`,
                [ride_id || null, amount, payment_method.toLowerCase(), phoneNumber, userId]
            );

            // If successful, send success response
            res.json({
                status: 'success',
                message: 'Payment processed successfully',
                payment_id: result.insertId
            });

        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }

    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process payment'
        });
    }
});

module.exports = router;