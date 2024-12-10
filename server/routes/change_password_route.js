const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const auth = require('../middleware/auth'); 
const router = express.Router();

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'aglugan',
};

router.post('/change-password', auth, async (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized access.' });
  }

  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ status: 'error', message: 'Both current and new passwords are required.' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute('SELECT password_hash FROM users WHERE user_id = ?', [userId]);
      if (rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'User not found.' });
      }

      const isMatch = await bcrypt.compare(current_password, rows[0].password_hash);
      if (!isMatch) {
        return res.status(401).json({ status: 'error', message: 'Current password is incorrect.' });
      }

      const newPasswordHash = await bcrypt.hash(new_password, 10);
      await connection.execute('UPDATE users SET password_hash = ? WHERE user_id = ?', [newPasswordHash, userId]);

      res.json({ status: 'success', message: 'Password changed successfully.' });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
});

module.exports = router;
