const express = require('express');
const router = express.Router();

router.get('/check-session', (req, res) => {
    console.log('Session on check-session:', req.session);
    if (req.session && req.session.adminId) {
        res.json({ status: 'logged_in', type: 'admin', adminId: req.session.adminId });
    } else if (req.session && req.session.user_id) {
        res.json({ status: 'logged_in', type: 'user', userId: req.session.user_id });
    } else {
        res.json({ status: 'logged_out' });
    }
});

module.exports = router;