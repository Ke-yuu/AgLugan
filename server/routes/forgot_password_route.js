const express = require('express');
const crypto = require('crypto');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const router = express.Router();

console.log('Loading forgot password route...');

// Direct database configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan'
});

// Test database connection
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Database connected successfully');
    }
});

// Test route
router.get('/forgot-password-test', (req, res) => {
    console.log('Test route accessed');
    res.json({ message: 'Forgot password route is working' });
});

// Main forgot password route
router.post('/forgot-password', async (req, res) => {
    console.log('POST /forgot-password accessed');
    console.log('Environment variables:', {
        EMAIL_USER: process.env.EMAIL_USER || 'not set',
        EMAIL_PASS: process.env.EMAIL_PASS ? 'set' : 'not set'
    });
    
    const { email } = req.body;

    if (!email) {
        console.log('No email provided');
        return res.status(400).json({ status: 'error', message: 'Email is required.' });
    }

    try {
        // Check if the email exists in the database
        const [userRows] = await db.promise().query('SELECT user_id FROM users WHERE email = ?', [email]);
        console.log('Database response:', userRows);

        if (userRows.length === 0) {
            console.log('Email not found:', email);
            return res.status(404).json({ status: 'error', message: 'Email not found.' });
        }

        const userId = userRows[0].user_id;

        // Generate a reset token and expiration time
        const token = crypto.randomBytes(50).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Store the token in the database
        const [result] = await db.promise().query(
            `INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)`,
            [userId, token, expires]
        );

        // Email credentials with fallback
        const emailUser = process.env.EMAIL_USER || 'izanamikuro02@gmail.com';
        const emailPass = process.env.EMAIL_PASS || 'pjsi wiew ejfh rvbn';

        console.log('Using email credentials:', {
            user: emailUser,
            passLength: emailPass.length
        });

        // Create reusable transporter with explicit credentials
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            },
            debug: true,
            logger: true
        });

        try {
            console.log('Verifying email configuration...');
            await transporter.verify();
            console.log('Email configuration is valid');

            // Construct reset link using the current domain
            const resetLink = `${req.protocol}://${req.get('host')}/resetPassword?token=${encodeURIComponent(token)}`;

            const mailOptions = {
                from: `"Password Reset" <${emailUser}>`,
                to: email,
                subject: 'Password Reset Request',
                html: `
                    <h2>Password Reset Request</h2>
                    <p>You requested a password reset. Click the button below to reset your password:</p>
                    <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            };

            console.log('Attempting to send email...');
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');

            res.json({ 
                status: 'success', 
                message: 'Request Sent!' 
            });
        } catch (emailError) {
            console.error('Email configuration error:', emailError);
            throw emailError;
        }
    } catch (error) {
        console.error('Error handling forgot password:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'An error occurred while processing your request.' 
        });
    }
});

module.exports = router;