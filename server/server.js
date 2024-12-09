const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const { networkInterfaces } = require('os');
const loginRoute = require('./routes/loginRoute'); 

const app = express();
const PORT = process.env.PORT || 3000;

// Set up session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.json());

// Serve static files from the 'client/public' directory
app.use(express.static(path.join(__dirname, '..', 'client', 'public')));

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'src', 'html', 'login.html'));
})

app.get('/schedule', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'src', 'html', 'schedule.html'));
})

app.get('/aboutUs', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'src', 'html', 'aboutUsPage.html'));
})

app.get('/driverDashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'src', 'html', 'driver-dashboard.html'));
})

app.get('/driverQueue', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'src', 'html', 'driver-queue.html'));
})

app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'src', 'html', 'paymentPage.html'));
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'src', 'html', 'register.html'));
})

app.get('/resetPassword', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'src', 'html', 'reset_password.html'));
})

app.get('/passengerDashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'src', 'html', 'passenger-dashboard.html'));
})

app.get('/adminDashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'src', 'html', 'admin-dashboard.html'));
})

app.get('/driverStats', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'src', 'html', 'driver-statistics.html'));
})



app.use('/api', loginRoute); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'src', 'html', 'index.html')); 
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // Get all network interfaces
    const nets = networkInterfaces();
    console.log('\nAvailable network access points:');

    // Loop through each network interface
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`- ${name}: http://${net.address}:${PORT}`);
            }
        }
    }

    console.log('\nStatic files are being served from:', path.join(__dirname, '..', 'client'));
});

// Add error handling for 404s
app.use((req, res) => {
    console.log('404 error for:', req.url);
    res.status(404).send('Resource not found');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Server error');
});
