const express = require('express');
const router = express.Router();
const AdminPresenter = require('../presenters/AdminPresenter');

router.post('/register', AdminPresenter.register);
router.post('/login', AdminPresenter.login);
router.get('/users', AdminPresenter.getUsers);
router.post('/restrict-user', AdminPresenter.restrictUser);
router.post('/approve-listing', AdminPresenter.approveListing);
router.post('/restock', AdminPresenter.restock);
router.get('/listings', AdminPresenter.getListings);
router.post('/create-listing', AdminPresenter.createListing);
router.get('/balance-requests', AdminPresenter.getBalanceRequests);
router.post('/process-balance-request', AdminPresenter.processBalanceRequest);
router.get('/stats', AdminPresenter.getStats);

module.exports = router;
