const express = require('express');
const crypto = require('crypto'); // To generate secure tokens
const db = require('../../public/database/db'); // Database connection
const nodemailer = require('nodemailer'); // For sending emails
const router = express.Router();

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ status: 'error', message: 'Email is required.' });
    }

    try {
        // Check if the email exists in the database
        const [userRows] = await db.promise().query('SELECT user_id FROM users WHERE email = ?', [email]);

        if (userRows.length === 0) {
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

        if (result.affectedRows === 0) {
            return res.status(500).json({ status: 'error', message: 'Failed to generate reset token.' });
        }

        // Send the reset email
        const resetLink = `http://yourwebsite.com/reset_password.html?token=${encodeURIComponent(token)}`;
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Use your email provider
            auth: {
                user: 'your-email@gmail.com', // Your email address
                pass: 'your-email-password', // Your email password
            },
        });

        const mailOptions = {
            from: 'no-reply@yourwebsite.com',
            to: email,
            subject: 'Password Reset Request',
            text: `To reset your password, click the link below:\n\n${resetLink}`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ status: 'success', message: 'Password reset link has been sent to your email.' });
    } catch (error) {
        console.error('Error handling forgot password:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
});

module.exports = router;
