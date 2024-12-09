const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const router = express.Router();

// Database connection configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan'
};

// Login route
router.post('/', async (req, res) => {
    try {
        // Check if the user is already logged in
        if (req.session.user_id) {
            return res.json({ status: 'success', redirectUrl: '../html/passenger-dashboard.html' });
        }

        // Ensure the required fields are set
        if (!req.body.username || !req.body.password) {
            return res.json({ status: 'error', message: 'Missing required fields.' });
        }

        // Sanitize user inputs
        const username = req.body.username;
        const password = req.body.password;

        // Create a connection to the database
        const connection = await mysql.createConnection(dbConfig);

        // Prepare the SQL statement to prevent SQL injection
        const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length > 0) {
            // Fetch the user details
            const user = rows[0];

            // Verify the hashed password
            if (await bcrypt.compare(password, user.password_hash)) {
                // Password matches, regenerate session ID to prevent session fixation
                req.session.regenerate((err) => {
                    if (err) {
                        console.error('Error regenerating session:', err);
                        return res.json({ status: 'error', message: 'An error occurred. Please try again.' });
                    }

                    // Store relevant user information in the session
                    req.session.user_id = user.user_id;
                    req.session.username = user.username;
                    req.session.user_type = user.user_type;

                    // Redirect based on user type and send it back in the JSON response
                    let redirectUrl = '';
                    if (user.user_type === 'Student' || user.user_type === 'Faculty/Staff') {
                        redirectUrl = '../html/passenger-dashboard.html';
                    } else if (user.user_type === 'Driver') {
                        redirectUrl = '../html/driver-dashboard.html';
                    }

                    res.json({ status: 'success', redirectUrl });
                });
            } else {
                // Invalid password
                res.json({ status: 'error', message: 'Invalid username or password.' });
            }
        } else {
            // Invalid username
            res.json({ status: 'error', message: 'Invalid username or password.' });
        }

        // Close the database connection
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
        res.json({ status: 'error', message: 'An error occurred. Please try again.' });
    }
});

module.exports = (req, res, next) => {
    if (req.session.user_id) {
        return next(); // User is authenticated, proceed to the protected route
    } else {
        return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }
}