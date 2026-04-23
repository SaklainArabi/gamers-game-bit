const { query } = require('../config/db');

const HelpModel = {
    async getAllQuestions() {
        return query(`
            SELECT hq.*, u.username 
            FROM Help_Question hq 
            JOIN User u ON hq.user_id = u.user_id 
            ORDER BY hq.created_at DESC
        `);
    },

    async askQuestion(userId, question) {
        return query('INSERT INTO Help_Question (user_id, question) VALUES (?, ?)', [userId, question]);
    },

    async getChatMessages(userId) {
        return query('SELECT * FROM Chat_Message WHERE user_id = ? ORDER BY created_at ASC', [userId]);
    },

    async getChatUsers() {
        return query(`
            SELECT DISTINCT u.user_id, u.username, u.email,
                   (SELECT COUNT(*) FROM Chat_Message WHERE user_id = u.user_id AND is_read = false AND sender_type = 'USER') as unread_count,
                   (SELECT MAX(created_at) FROM Chat_Message WHERE user_id = u.user_id) as last_message
            FROM User u
            JOIN Chat_Message cm ON u.user_id = cm.user_id
            ORDER BY last_message DESC
        `);
    },

    async getQuestionsForAdmin() {
        return query(`
            SELECT hq.*, u.username, u.email 
            FROM Help_Question hq 
            JOIN User u ON hq.user_id = u.user_id 
            ORDER BY CASE WHEN hq.answer IS NULL THEN 0 ELSE 1 END, hq.created_at DESC
        `);
    },

    async findQuestionById(questionId) {
        return query('SELECT * FROM Help_Question WHERE question_id = ?', [questionId]);
    },

    async answerQuestion(questionId, answer, adminId) {
        return query(
            'UPDATE Help_Question SET answer = ?, answered_by = ?, answered_at = NOW() WHERE question_id = ?',
            [answer, adminId, questionId]
        );
    },

    async getUnansweredCount() {
        return query('SELECT COUNT(*) as count FROM Help_Question WHERE answer IS NULL');
    },

    async saveChatMessage(userId, adminId, message, senderType) {
        return query(
            'INSERT INTO Chat_Message (user_id, admin_id, message, sender_type) VALUES (?, ?, ?, ?)',
            [userId, adminId, message, senderType]
        );
    },

    async deleteChatByUser(userId) {
        return query('DELETE FROM Chat_Message WHERE user_id = ?', [userId]);
    },

    async deleteQuestionsByUser(userId) {
        return query('DELETE FROM Help_Question WHERE user_id = ?', [userId]);
    }
};

module.exports = HelpModel;
