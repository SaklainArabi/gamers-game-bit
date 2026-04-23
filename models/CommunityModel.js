const { query } = require('./db');

class CommunityModel {
    static async getThreads(sort) {
        let orderBy = 't.is_pinned DESC, t.created_at DESC';
        if (sort === 'popular') orderBy = 't.is_pinned DESC, t.upvote_count DESC';
        
        return await query(`
            SELECT t.*, u.username,
                   (SELECT COUNT(*) FROM Thread_Comment WHERE thread_id = t.thread_id) as comment_count
            FROM Thread t 
            JOIN User u ON t.user_id = u.user_id 
            ORDER BY ${orderBy}
        `);
    }

    static async getThread(threadId) {
        const threads = await query(`
            SELECT t.*, u.username 
            FROM Thread t 
            JOIN User u ON t.user_id = u.user_id 
            WHERE t.thread_id = ?
        `, [threadId]);
        return threads.length > 0 ? threads[0] : null;
    }

    static async getComments(threadId) {
        return await query(`
            SELECT c.*, u.username 
            FROM Thread_Comment c 
            JOIN User u ON c.user_id = u.user_id 
            WHERE c.thread_id = ? 
            ORDER BY c.upvote_count DESC, c.created_at ASC
        `, [threadId]);
    }

    static async hasUserUpvotedThread(threadId, userId) {
        const upvotes = await query('SELECT * FROM Thread_Upvote WHERE thread_id = ? AND user_id = ?', [threadId, userId]);
        return upvotes.length > 0;
    }

    static async createThread(title, content, userId) {
        return await query('INSERT INTO Thread (title, content, user_id) VALUES (?, ?, ?)', [title, content, userId]);
    }

    static async toggleThreadUpvote(threadId, userId) {
        const existing = await query('SELECT * FROM Thread_Upvote WHERE thread_id = ? AND user_id = ?', [threadId, userId]);
        if (existing.length > 0) {
            await query('DELETE FROM Thread_Upvote WHERE thread_id = ? AND user_id = ?', [threadId, userId]);
            await query('UPDATE Thread SET upvote_count = upvote_count - 1 WHERE thread_id = ?', [threadId]);
            return 'removed';
        } else {
            await query('INSERT INTO Thread_Upvote (thread_id, user_id) VALUES (?, ?)', [threadId, userId]);
            await query('UPDATE Thread SET upvote_count = upvote_count + 1 WHERE thread_id = ?', [threadId]);
            return 'added';
        }
    }

    static async createComment(threadId, commentText, userId) {
        return await query('INSERT INTO Thread_Comment (thread_id, comment_text, user_id) VALUES (?, ?, ?)', [threadId, commentText, userId]);
    }

    static async toggleCommentUpvote(commentId, userId) {
        const existing = await query('SELECT * FROM Comment_Upvote WHERE comment_id = ? AND user_id = ?', [commentId, userId]);
        if (existing.length > 0) {
            await query('DELETE FROM Comment_Upvote WHERE comment_id = ? AND user_id = ?', [commentId, userId]);
            await query('UPDATE Thread_Comment SET upvote_count = upvote_count - 1 WHERE comment_id = ?', [commentId]);
            return 'removed';
        } else {
            await query('INSERT INTO Comment_Upvote (comment_id, user_id) VALUES (?, ?)', [commentId, userId]);
            await query('UPDATE Thread_Comment SET upvote_count = upvote_count + 1 WHERE comment_id = ?', [commentId]);
            return 'added';
        }
    }
}

module.exports = CommunityModel;
