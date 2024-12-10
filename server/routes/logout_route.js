const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const logoutRoute = require('./routes/logout');

const app = express();

app.use(bodyParser.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
}));

// Register the logout route
app.use('/api', logoutRoute);

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
