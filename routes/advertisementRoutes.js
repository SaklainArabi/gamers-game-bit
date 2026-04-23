const express = require('express');
const router = express.Router();
const advertisementController = require('../controllers/advertisementController');
const { requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/advertisements', advertisementController.getActive);
router.post('/advertisement/:id/click', advertisementController.click);

// Admin routes
router.post('/admin/advertisement/create', requireAdmin, advertisementController.create);
router.get('/admin/advertisements', requireAdmin, advertisementController.getAll);
router.put('/admin/advertisement/:id/toggle', requireAdmin, advertisementController.toggle);
router.delete('/admin/advertisement/:id', requireAdmin, advertisementController.deleteAd);

module.exports = router;
