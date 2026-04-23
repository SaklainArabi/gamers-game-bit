const express = require('express');
const router = express.Router();
const UserPresenter = require('../presenters/UserPresenter');

// User Auth & Profile
router.post('/register', UserPresenter.register);
router.post('/login', UserPresenter.login);
router.get('/profile', UserPresenter.getProfile);
router.put('/profile', UserPresenter.updateProfile);

module.exports = router;
