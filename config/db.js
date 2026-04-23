const mysql = require('mysql2');

// Try to load dotenv, but don't fail if not present
try {
    require('dotenv').config();
} catch (e) {
    console.log('dotenv not loaded, using defaults');
}

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootroot',
    database: process.env.DB_NAME || 'game_marketplace'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Promisify database queries
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

module.exports = { db, query };
