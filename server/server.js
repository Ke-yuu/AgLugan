const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const { networkInterfaces } = require('os');
const cors = require('cors');
require('dotenv').config();
console.log('Environment variables loaded:', {
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS ? '***exists***' : 'missing'
});
// Route imports
const loginRoute = require('./routes/loginRoute');
const resetPasswordRoute = require('./routes/reset_password_route');
const forgotPasswordRoute = require('./routes/forgot_password_route');
const checkSessionRoute = require('./routes/check_session_route');
const passengerDashboardRoute = require('./routes/passenger_dashboard_route');
const updateProfileRoute = require('./routes/update_profile_route');
const changePasswordRoute = require('./routes/change_password_route');
const logoutRoute = require('./routes/logout_route');
const registerRoute = require('./routes/register_route');
const checkUniqueRoute = require('./routes/check_unique_route');
const getRidesRoute = require('./routes/get_rides_route'); 
const updateRideStatusRoute = require('./routes/update_ride_status_route'); 
const paymentAmountRoute = require('./routes/payment_amount_route');
const processPaymentRoute = require('./routes/process_payment_route');
const driverDashboardRoute = require('./routes/driver_dashboard_route');
const adminLoginRoute = require('./routes/admin_login_route');
const getUsersRoute = require('./routes/get_users_route');
const adminDashboardRoute = require('./routes/admin_dashboard_route');


const app = express();
const PORT = process.env.PORT || 3000;

// Logging middleware (placed first to catch all requests)
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Enable CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://192.168.0.119:3000', 'http://192.168.1.2:3000', 'http://192.168.100.41:3000', 'http://192.168.2.7:3000' ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'AGLUGAN',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax',
    }
}));
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});
// Static files middleware
app.use(express.static(path.join(__dirname, '..', 'client', 'public')));
app.use(express.static(path.join(__dirname, '..', 'client', 'src')));
app.use('/media', express.static(path.join(__dirname, 'media')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// API Routes
app.use('/api', forgotPasswordRoute);
app.use('/api', resetPasswordRoute);
app.use('/api', loginRoute);
app.use('/api', logoutRoute);
app.use('/api', checkSessionRoute);
app.use('/api', passengerDashboardRoute);
app.use('/api', updateProfileRoute);
app.use('/api', changePasswordRoute);
app.use('/api', registerRoute);
app.use('/api', checkUniqueRoute);
app.use('/api', getRidesRoute);
app.use('/api', updateRideStatusRoute); 
app.use('/api', paymentAmountRoute);
app.use('/api', processPaymentRoute);
app.use('/api', driverDashboardRoute);
app.use('/api', adminLoginRoute);
app.use('/api', getUsersRoute);
app.use('/api', adminDashboardRoute);
app.use('/api/admin-dashboard', adminDashboardRoute);


// HTML Routes
const htmlRoutes = {
    '/': 'index.html',
    '/login': 'login.html',
    '/schedule': 'schedule.html',
    '/aboutUs': 'aboutUsPage.html',
    '/driverDashboard': 'driver-dashboard.html',
    '/driverQueue': 'driver-queue.html',
    '/payment': 'paymentPage.html',
    '/register': 'register.html',
    '/resetPassword': 'reset_password.html',
    '/passengerDashboard': 'passenger-dashboard.html',
    '/driverStats': 'driver-statistics.html',
    '/adminlogin': 'admin-login.html',
    '/admindashboard': 'admin-dashboard.html',
    '/resetPassword' : 'reset_password.html'
};

// Set up HTML routes
Object.entries(htmlRoutes).forEach(([route, file]) => {
    app.get(route, (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'client', 'src', 'html', file));
    });
});

// 404 handler
app.use((req, res) => {
    console.log('404 error for:', req.url);
    res.status(404).send('Resource not found');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // Display available network interfaces
    const nets = networkInterfaces();
    console.log('\nAvailable network access points:');
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`- ${name}: http://${net.address}:${PORT}`);
            }
        }
    }

    console.log('\nStatic files are being served from:', path.join(__dirname, '..', 'client'));
});