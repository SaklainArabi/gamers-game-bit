const { query } = require('../config/db');

const NotificationModel = {
    async create(userId, type, title, message, link) {
        return query(
            'INSERT INTO Notification (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)',
            [userId, type, title, message, link]
        );
    },

    async getByUser(userId) {
        return query(
            'SELECT * FROM Notification WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [userId]
        );
    },

    async markRead(notificationId, userId) {
        return query('UPDATE Notification SET is_read = true WHERE notification_id = ? AND user_id = ?', [notificationId, userId]);
    },

    async markAllRead(userId) {
        return query('UPDATE Notification SET is_read = true WHERE user_id = ?', [userId]);
    },

    async deleteByUser(userId) {
        return query('DELETE FROM Notification WHERE user_id = ?', [userId]);
    }
};

module.exports = NotificationModel;
