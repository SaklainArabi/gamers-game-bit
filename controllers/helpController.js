const HelpModel = require('../models/helpModel');
const { sendNotification, notifyAdmins } = require('../utils/notification');

const helpController = {
    async getQuestions(req, res) {
        try {
            const questions = await HelpModel.getAllQuestions();
            res.json({ success: true, questions });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching questions' });
        }
    },

    async ask(req, res) {
        const { question } = req.body;
        
        if (!question || question.trim() === '') {
            return res.status(400).json({ success: false, message: 'Question cannot be empty' });
        }
        
        try {
            await HelpModel.askQuestion(req.session.user.id, question);
            notifyAdmins('HELP', 'New Help Question', 'A user needs assistance');
            res.json({ success: true, message: 'Question submitted' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error submitting question' });
        }
    },

    async getChat(req, res) {
        const userId = req.session.user.type === 'admin' ? req.params.userId : req.session.user.id;
        
        try {
            const messages = await HelpModel.getChatMessages(userId);
            res.json({ success: true, messages });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching messages' });
        }
    },

    // Admin routes
    async getChatUsers(req, res) {
        try {
            const users = await HelpModel.getChatUsers();
            res.json({ success: true, users });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching users' });
        }
    },

    async getQuestionsForAdmin(req, res) {
        try {
            const questions = await HelpModel.getQuestionsForAdmin();
            res.json({ success: true, questions });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching questions' });
        }
    },

    async answerQuestion(req, res) {
        const { questionId, answer } = req.body;
        
        try {
            const questions = await HelpModel.findQuestionById(questionId);
            if (questions.length === 0) {
                return res.status(404).json({ success: false, message: 'Question not found' });
            }
            
            await HelpModel.answerQuestion(questionId, answer, req.session.user.id);
            
            await sendNotification(questions[0].user_id, 'SYSTEM',
                'Question Answered',
                'Your help question has been answered!',
                '/help'
            );
            
            res.json({ success: true, message: 'Answer submitted' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error answering question' });
        }
    }
};

module.exports = helpController;
