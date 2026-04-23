const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { requireUser } = require('../middleware/auth');

router.get('/subscription/plans', subscriptionController.getPlans);
router.post('/subscription/create', requireUser, subscriptionController.create);
router.post('/subscription/cancel', requireUser, subscriptionController.cancel);

module.exports = router;
