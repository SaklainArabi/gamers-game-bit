const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

// Try to load dotenv, but don't fail if not present
try {
    require('dotenv').config();
} catch (e) {
    console.log('dotenv not loaded, using defaults');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public/react-build')));
app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'game-marketplace-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

// Database connection
const { db, query } = require('./models/db');

app.use('/api', require('./routes'));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'react-build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
