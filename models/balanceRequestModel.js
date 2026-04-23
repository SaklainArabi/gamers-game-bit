const { query } = require('../config/db');

const BalanceRequestModel = {
    async create(userId, amount) {
        return query('INSERT INTO Balance_Request (user_id, amount) VALUES (?, ?)', [userId, amount]);
    },

    async getByUser(userId) {
        return query('SELECT * FROM Balance_Request WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    },

    async getAllForAdmin() {
        return query(`
            SELECT br.*, u.username, u.email 
            FROM Balance_Request br 
            JOIN User u ON br.user_id = u.user_id 
            ORDER BY CASE WHEN br.status = 'PENDING' THEN 1 ELSE 2 END, br.created_at DESC
        `);
    },

    async findById(requestId) {
        return query('SELECT * FROM Balance_Request WHERE request_id = ?', [requestId]);
    },

    async process(requestId, status, adminId) {
        return query('UPDATE Balance_Request SET status = ?, processed_at = NOW(), processed_by = ? WHERE request_id = ?',
            [status, adminId, requestId]);
    },

    async getPendingCount() {
        return query("SELECT COUNT(*) as count FROM Balance_Request WHERE status = 'PENDING'");
    },

    async deleteByUser(userId) {
        return query('DELETE FROM Balance_Request WHERE user_id = ?', [userId]);
    }
};

module.exports = BalanceRequestModel;
