module.exports = (req, res, next) => {
    if (!req.session || !req.session.user_id) {
        return res.status(401).json({ status: 'error', message: 'User not logged in.' });
    }
    next();
};
console.log('Auth middleware triggered');