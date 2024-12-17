module.exports = function (req, res, next) {
    console.log('Session Data in Middleware:', req.session);
    if (req.session && req.session.user_id) {
        console.log(`User authenticated: ${req.session.username} (ID: ${req.session.user_id})`);
        next();
    } else {
        console.log('Unauthorized access. Session not found.');
        res.status(401).json({ success: false, message: 'Session expired. Please log in.' });
    }
};
