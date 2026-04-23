const express = require('express');
const router = express.Router();
const helpController = require('../controllers/helpController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/help/questions', helpController.getQuestions);

// Authenticated routes
router.post('/help/ask', requireAuth, helpController.ask);
router.get('/help/chat/:userId', requireAuth, helpController.getChat);

// Admin routes
router.get('/admin/chat-users', requireAdmin, helpController.getChatUsers);
router.get('/admin/help-questions', requireAdmin, helpController.getQuestionsForAdmin);
router.post('/admin/answer-question', requireAdmin, helpController.answerQuestion);

module.exports = router;
