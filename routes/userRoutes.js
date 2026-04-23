const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireUser } = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (require user auth)
router.get('/profile', requireUser, userController.getProfile);
router.put('/profile', requireUser, userController.updateProfile);
router.delete('/account', requireUser, userController.deleteAccount);
router.get('/notifications', requireUser, userController.getNotifications);
router.put('/notification/:id/read', requireUser, userController.markNotificationRead);
router.put('/notifications/read-all', requireUser, userController.markAllNotificationsRead);

module.exports = router;
