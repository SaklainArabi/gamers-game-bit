const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/logout', sessionController.logout);
router.get('/check-session', sessionController.checkSession);
router.get('/languages', sessionController.getLanguages);

module.exports = router;
