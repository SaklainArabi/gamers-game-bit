const express = require('express');
const router = express.Router();
const CommunityPresenter = require('../presenters/CommunityPresenter');

router.get('/threads', CommunityPresenter.getThreads);
router.get('/thread/:id', CommunityPresenter.getThread);
router.post('/thread/create', CommunityPresenter.createThread);
router.post('/thread/:id/upvote', CommunityPresenter.toggleUpvote);
router.post('/comment/create', CommunityPresenter.createComment);
router.post('/comment/:id/upvote', CommunityPresenter.toggleCommentUpvote);

module.exports = router;
