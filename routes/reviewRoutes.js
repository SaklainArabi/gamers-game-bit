const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireUser } = require('../middleware/auth');

router.post('/listing/:id/review', requireUser, reviewController.create);
router.get('/listing/:id/reviews', reviewController.getByListing);

module.exports = router;
