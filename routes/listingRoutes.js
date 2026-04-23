const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { requireUser, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/categories', listingController.getCategories);
router.get('/listings', listingController.getAll);
router.get('/search', listingController.search);
router.get('/listing/:id', listingController.getById);
router.post('/games/compare', listingController.compare);

// User routes
router.post('/listing/create', requireUser, listingController.create);
router.get('/user/my-listings', requireUser, listingController.getMyListings);
router.post('/user/restock', requireUser, listingController.userRestock);

// Admin routes
router.post('/admin/category/create', requireAdmin, listingController.createCategory);
router.delete('/admin/category/:id', requireAdmin, listingController.deleteCategory);

module.exports = router;
