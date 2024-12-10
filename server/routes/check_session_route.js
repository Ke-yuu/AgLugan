const express = require('express');
const router = express.Router();

// Check session status
router.get('/check-session', (req, res) => {
    if (req.session && req.session.user_id) {
        res.json({ status: 'logged_in' });
    } else {
        res.json({ status: 'logged_out' });
    }
});

module.exports = router;
