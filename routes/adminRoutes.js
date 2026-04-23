const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

// Public routes
router.post('/register', adminController.register);
router.post('/login', adminController.login);

// Protected routes (require admin auth)
router.get('/users', requireAdmin, adminController.getUsers);
router.post('/restrict-user', requireAdmin, adminController.restrictUser);
router.post('/approve-listing', requireAdmin, adminController.approveListing);
router.post('/restock', requireAdmin, adminController.restock);
router.get('/listings', requireAdmin, adminController.getListings);
router.post('/create-listing', requireAdmin, adminController.createListing);
router.get('/balance-requests', requireAdmin, adminController.getBalanceRequests);
router.post('/process-balance-request', requireAdmin, adminController.processBalanceRequest);
router.get('/stats', requireAdmin, adminController.getStats);

module.exports = router;
