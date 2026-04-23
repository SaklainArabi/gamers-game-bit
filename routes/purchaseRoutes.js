const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { requireUser } = require('../middleware/auth');

router.post('/listing/buy', requireUser, purchaseController.buy);
router.get('/user/purchases', requireUser, purchaseController.getMyPurchases);
router.post('/user/request-balance', requireUser, purchaseController.requestBalance);
router.get('/user/balance-requests', requireUser, purchaseController.getBalanceRequests);
router.get('/leaderboard', purchaseController.getLeaderboard);

module.exports = router;
