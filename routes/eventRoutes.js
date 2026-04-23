const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireUser, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/events', eventController.getAll);
router.get('/event/:id', eventController.getById);

// User routes
router.post('/event/:id/register', requireUser, eventController.register);

// Admin routes
router.post('/admin/event/create', requireAdmin, eventController.create);
router.put('/admin/event/:id/status', requireAdmin, eventController.updateStatus);
router.delete('/admin/event/:id', requireAdmin, eventController.deleteEvent);
router.post('/admin/event/:id/results', requireAdmin, eventController.saveResults);

module.exports = router;
