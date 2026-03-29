const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'gondola.proxy.rlwy.net',
    port: process.env.DB_PORT || 20877, 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'MMvKSmmQnvsGqntTwzwTrHXRduyFnRyv',
    database: process.env.DB_NAME || 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to MySQL database.');
        connection.release();
    }
});

module.exports = pool.promise();
