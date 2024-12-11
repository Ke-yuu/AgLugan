const mysql = require('mysql2/promise');

// Create a database connection pool
const db = mysql.createPool({
    host: '127.0.0.1',     // Database host
    user: 'root',          // Database username
    password: '',          // Database password
    database: 'aglugan',   // Database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Export the pool for use in other modules
module.exports = db;
