const mysql = require('mysql2');

// MySQL database connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'aglugan'
});

// Connect to the database and handle errors
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        process.exit(1); // Exit the process if the database connection fails
    }
    console.log('Connected to the MySQL database.');
});

module.exports = db;