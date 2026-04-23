const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { requireUser } = require('../middleware/auth');

router.get('/community/threads', communityController.getThreads);
router.get('/community/thread/:id', communityController.getThread);
router.post('/community/thread/create', requireUser, communityController.createThread);
router.post('/community/thread/:id/upvote', requireUser, communityController.upvoteThread);
router.post('/community/comment/create', requireUser, communityController.createComment);
router.post('/community/comment/:id/upvote', requireUser, communityController.upvoteComment);

module.exports = router;
