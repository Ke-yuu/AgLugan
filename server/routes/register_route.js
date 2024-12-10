const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../../public/database/db'); // Import your database connection
const router = express.Router();

// POST endpoint for user registration
router.post('/register', async (req, res) => {
    const { name, username, email, password, phone_number, user_type = 'Student' } = req.body;

    // Validate required fields
    if (!name || !username || !email || !password || !phone_number) {
        return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }

    // Validate user type
    const validUserTypes = ['Student', 'Faculty/Staff', 'Driver'];
    const userType = validUserTypes.includes(user_type) ? user_type : 'Student';

    try {
        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Insert the new user into the database
        const query = `
            INSERT INTO users (name, username, email, password_hash, phone_number, user_type)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.promise().query(query, [name, username, email, hashedPassword, phone_number, userType]);

        if (result.affectedRows === 1) {
            res.json({ status: 'success', message: 'Registration successful' });
        } else {
            res.status(500).json({ status: 'error', message: 'Error registering user' });
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ status: 'error', message: 'Server error during registration' });
    }
});

module.exports = router;
