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

router.post('/payment-amount', (req, res) => {
    const userType = (req.session.user_type || 'student').toLowerCase();
    const status = (req.body.status || 'scheduled').toLowerCase();

    let baseAmount = userType === 'faculty/staff' ? 15 : 13;
    let additionalFee = status === 'scheduled' ? 5 : 0;
    let totalAmount = baseAmount + additionalFee;

    res.json({
        status: 'success',
        amount: totalAmount,
        debug: {
            user_type: userType,
            ride_status: status,
            base_amount: baseAmount,
            additional_fee: additionalFee
        }
    });
});

module.exports = router;