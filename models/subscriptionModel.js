const { query } = require('../config/db');

const SubscriptionModel = {
    async getActive(userId) {
        return query("SELECT * FROM Subscription WHERE user_id = ? AND status = 'ACTIVE'", [userId]);
    },

    async create(userId, planType, endDate) {
        return query(
            `INSERT INTO Subscription (user_id, plan_type, status, start_date, end_date) 
             VALUES (?, ?, 'ACTIVE', NOW(), ?)`,
            [userId, planType, endDate]
        );
    },

    async cancel(userId) {
        return query("UPDATE Subscription SET status = 'CANCELLED' WHERE user_id = ? AND status = 'ACTIVE'", [userId]);
    },

    async getActiveCount() {
        return query("SELECT COUNT(*) as count FROM Subscription WHERE status = 'ACTIVE'");
    },

    async deleteByUser(userId) {
        return query('DELETE FROM Subscription WHERE user_id = ?', [userId]);
    }
};

module.exports = SubscriptionModel;
