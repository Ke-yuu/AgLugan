const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const { networkInterfaces } = require('os');
const cors = require('cors');
const loginRoute = require('./routes/loginRoute');
const checkSessionRoute = require('./routes/check_session_route');
const passengerDashboardRoute = require('./routes/passenger_dashboard_route');
const updateProfileRoute = require('./routes/update_profile_route');
const changePasswordRoute = require('./routes/change_password_route');
const logoutRoute = require('./routes/logout_route');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://192.168.0.119:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Parse request bodies
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
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files - order matters!
app.use(express.static(path.join(__dirname, '..', 'client', 'public')));
app.use(express.static(path.join(__dirname, '..', 'client', 'src')));
app.use('/media', express.static(path.join(__dirname, 'media')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Mount API routes first
app.use('/api', loginRoute);
app.use('/api', logoutRoute);
app.use('/api', checkSessionRoute);
app.use('/api', passengerDashboardRoute);
app.use('/api', updateProfileRoute); 
app.use('/api', changePasswordRoute);

// HTML routes
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
    '/adminDashboard': 'admin-dashboard.html',
    '/driverStats': 'driver-statistics.html'
};

// Set up HTML routes
Object.entries(htmlRoutes).forEach(([route, file]) => {
    app.get(route, (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'client', 'src', 'html', file));
    });
});

// 404 handler - Must come after all other routes
app.use((req, res) => {
    console.log('404 error for:', req.url);
    res.status(404).send('Resource not found');
});

// Global error handler - Consolidated into one
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // Get network interfaces
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