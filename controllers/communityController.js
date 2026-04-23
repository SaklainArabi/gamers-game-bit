const CommunityModel = require('../models/communityModel');
const { sendNotification } = require('../utils/notification');

const communityController = {
    async getThreads(req, res) {
        try {
            const threads = await CommunityModel.getThreads(req.query.sort);
            res.json({ success: true, threads });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching threads' });
        }
    },

    async getThread(req, res) {
        const threadId = req.params.id;
        
        try {
            const threads = await CommunityModel.getThreadById(threadId);
            
            if (threads.length === 0) {
                return res.status(404).json({ success: false, message: 'Thread not found' });
            }
            
            const comments = await CommunityModel.getCommentsByThread(threadId);
            
            let userUpvoted = false;
            if (req.session.user) {
                const upvotes = await CommunityModel.getUserThreadUpvote(threadId, req.session.user.id);
                userUpvoted = upvotes.length > 0;
            }
            
            res.json({ success: true, thread: threads[0], comments, userUpvoted });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching thread' });
        }
    },

    async createThread(req, res) {
        const { title, content } = req.body;
        
        try {
            const result = await CommunityModel.createThread(title, content, req.session.user.id);
            res.json({ success: true, message: 'Thread created', threadId: result.insertId });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error creating thread' });
        }
    },

    async upvoteThread(req, res) {
        const threadId = req.params.id;
        
        try {
            const existing = await CommunityModel.getUserThreadUpvote(threadId, req.session.user.id);
            
            if (existing.length > 0) {
                await CommunityModel.removeThreadUpvote(threadId, req.session.user.id);
                await CommunityModel.decrementThreadUpvotes(threadId);
                res.json({ success: true, action: 'removed' });
            } else {
                await CommunityModel.addThreadUpvote(threadId, req.session.user.id);
                await CommunityModel.incrementThreadUpvotes(threadId);
                res.json({ success: true, action: 'added' });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error upvoting' });
        }
    },

    async createComment(req, res) {
        const { threadId, commentText } = req.body;
        
        try {
            await CommunityModel.createComment(threadId, commentText, req.session.user.id);
            
            const threads = await CommunityModel.getThreadById(threadId);
            if (threads.length > 0 && threads[0].user_id !== req.session.user.id) {
                await sendNotification(threads[0].user_id, 'COMMENT',
                    'New Comment',
                    `Someone commented on your thread "${threads[0].title}"`,
                    '/user-dashboard'
                );
            }
            
            res.json({ success: true, message: 'Comment added' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error adding comment' });
        }
    },

    async upvoteComment(req, res) {
        const commentId = req.params.id;
        
        try {
            const existing = await CommunityModel.getUserCommentUpvote(commentId, req.session.user.id);
            
            if (existing.length > 0) {
                await CommunityModel.removeCommentUpvote(commentId, req.session.user.id);
                await CommunityModel.decrementCommentUpvotes(commentId);
                res.json({ success: true, action: 'removed' });
            } else {
                await CommunityModel.addCommentUpvote(commentId, req.session.user.id);
                await CommunityModel.incrementCommentUpvotes(commentId);
                res.json({ success: true, action: 'added' });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error upvoting' });
        }
    }
};

module.exports = communityController;
