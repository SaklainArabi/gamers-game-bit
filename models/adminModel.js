const { query } = require('../config/db');

const AdminModel = {
    async findByCredentials(username, password) {
        return query('SELECT * FROM Admin WHERE username = ? AND password = ?', [username, password]);
    },

    async create(username, email, password) {
        return query('INSERT INTO Admin (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
    }
};

module.exports = AdminModel;
