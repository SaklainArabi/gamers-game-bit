const { query } = require('../config/db');

const CommunityModel = {
    async getThreads(sort) {
        let orderBy = 't.is_pinned DESC, t.created_at DESC';
        if (sort === 'popular') {
            orderBy = 't.is_pinned DESC, t.upvote_count DESC';
        }
        return query(`
            SELECT t.*, u.username,
                   (SELECT COUNT(*) FROM Thread_Comment WHERE thread_id = t.thread_id) as comment_count
            FROM Thread t 
            JOIN User u ON t.user_id = u.user_id 
            ORDER BY ${orderBy}
        `);
    },

    async getThreadById(threadId) {
        return query(`
            SELECT t.*, u.username 
            FROM Thread t 
            JOIN User u ON t.user_id = u.user_id 
            WHERE t.thread_id = ?
        `, [threadId]);
    },

    async getCommentsByThread(threadId) {
        return query(`
            SELECT c.*, u.username 
            FROM Thread_Comment c 
            JOIN User u ON c.user_id = u.user_id 
            WHERE c.thread_id = ? 
            ORDER BY c.upvote_count DESC, c.created_at ASC
        `, [threadId]);
    },

    async getUserThreadUpvote(threadId, userId) {
        return query('SELECT * FROM Thread_Upvote WHERE thread_id = ? AND user_id = ?', [threadId, userId]);
    },

    async createThread(title, content, userId) {
        return query('INSERT INTO Thread (title, content, user_id) VALUES (?, ?, ?)', [title, content, userId]);
    },

    async addThreadUpvote(threadId, userId) {
        return query('INSERT INTO Thread_Upvote (thread_id, user_id) VALUES (?, ?)', [threadId, userId]);
    },

    async removeThreadUpvote(threadId, userId) {
        return query('DELETE FROM Thread_Upvote WHERE thread_id = ? AND user_id = ?', [threadId, userId]);
    },

    async incrementThreadUpvotes(threadId) {
        return query('UPDATE Thread SET upvote_count = upvote_count + 1 WHERE thread_id = ?', [threadId]);
    },

    async decrementThreadUpvotes(threadId) {
        return query('UPDATE Thread SET upvote_count = upvote_count - 1 WHERE thread_id = ?', [threadId]);
    },

    async createComment(threadId, commentText, userId) {
        return query('INSERT INTO Thread_Comment (thread_id, comment_text, user_id) VALUES (?, ?, ?)', [threadId, commentText, userId]);
    },

    async getUserCommentUpvote(commentId, userId) {
        return query('SELECT * FROM Comment_Upvote WHERE comment_id = ? AND user_id = ?', [commentId, userId]);
    },

    async addCommentUpvote(commentId, userId) {
        return query('INSERT INTO Comment_Upvote (comment_id, user_id) VALUES (?, ?)', [commentId, userId]);
    },

    async removeCommentUpvote(commentId, userId) {
        return query('DELETE FROM Comment_Upvote WHERE comment_id = ? AND user_id = ?', [commentId, userId]);
    },

    async incrementCommentUpvotes(commentId) {
        return query('UPDATE Thread_Comment SET upvote_count = upvote_count + 1 WHERE comment_id = ?', [commentId]);
    },

    async decrementCommentUpvotes(commentId) {
        return query('UPDATE Thread_Comment SET upvote_count = upvote_count - 1 WHERE comment_id = ?', [commentId]);
    },

    async deleteThreadUpvotesByUser(userId) {
        return query('DELETE FROM Thread_Upvote WHERE user_id = ?', [userId]);
    },

    async deleteCommentUpvotesByUser(userId) {
        return query('DELETE FROM Comment_Upvote WHERE user_id = ?', [userId]);
    },

    async deleteCommentsByUser(userId) {
        return query('DELETE FROM Thread_Comment WHERE user_id = ?', [userId]);
    },

    async deleteThreadsByUser(userId) {
        return query('DELETE FROM Thread WHERE user_id = ?', [userId]);
    }
};

module.exports = CommunityModel;
