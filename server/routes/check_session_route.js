const express = require('express');
const router = express.Router();

router.get('/check-session', (req, res) => {
    console.log('Session user_id:', req.session?.user_id);
    if (req.session && req.session.user_id) {
        res.json({ status: 'logged_in' });
    } else {
        res.json({ status: 'logged_out' });
    }
});
module.exports = router;