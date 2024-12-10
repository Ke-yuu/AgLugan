// middleware/authMiddleware.js
const authMiddleware = (req, res, next) => {
    if (req.session.user_id) {
        return next();
    }
    return res.status(401).json({ status: 'error', message: 'Not authenticated' });
};

module.exports = authMiddleware;