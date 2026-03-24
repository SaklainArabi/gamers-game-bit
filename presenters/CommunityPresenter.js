const CommunityModel = require('../models/CommunityModel');

class CommunityPresenter {
    static async getThreads(req, res) {
        try {
            const threads = await CommunityModel.getThreads(req.query.sort);
            res.json({ success: true, threads });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching threads' });
        }
    }

    static async getThread(req, res) {
        try {
            const thread = await CommunityModel.getThread(req.params.id);
            if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });
            
            const comments = await CommunityModel.getComments(req.params.id);
            let userUpvoted = false;
            
            if (req.session.user) {
                userUpvoted = await CommunityModel.hasUserUpvotedThread(req.params.id, req.session.user.id);
            }
            
            res.json({ success: true, thread, comments, userUpvoted });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching thread' });
        }
    }

    static async createThread(req, res) {
        if (!req.session.user || req.session.user.type !== 'user') return res.status(401).json({ success: false, message: 'User login required' });
        try {
            const result = await CommunityModel.createThread(req.body.title, req.body.content, req.session.user.id);
            res.json({ success: true, message: 'Thread created', threadId: result.insertId });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error creating thread' });
        }
    }

    static async toggleUpvote(req, res) {
        if (!req.session.user || req.session.user.type !== 'user') return res.status(401).json({ success: false, message: 'User login required' });
        try {
            const action = await CommunityModel.toggleThreadUpvote(req.params.id, req.session.user.id);
            res.json({ success: true, action });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error upvoting' });
        }
    }

    static async createComment(req, res) {
        if (!req.session.user || req.session.user.type !== 'user') return res.status(401).json({ success: false, message: 'User login required' });
        try {
            await CommunityModel.createComment(req.body.threadId, req.body.commentText, req.session.user.id);
            
            res.json({ success: true, message: 'Comment added' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error adding comment' });
        }
    }

    static async toggleCommentUpvote(req, res) {
        if (!req.session.user || req.session.user.type !== 'user') return res.status(401).json({ success: false, message: 'User login required' });
        try {
            const action = await CommunityModel.toggleCommentUpvote(req.params.id, req.session.user.id);
            res.json({ success: true, action });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error upvoting' });
        }
    }
}

module.exports = CommunityPresenter;
