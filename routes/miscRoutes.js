const express = require('express');
const router = express.Router();
const MiscPresenter = require('../presenters/MiscPresenter');

// Events
router.get('/events', MiscPresenter.getEvents);
router.get('/event/:id', MiscPresenter.getEvent);
router.post('/event/:id/register', MiscPresenter.registerForEvent);
router.post('/admin/event/create', MiscPresenter.createEvent);
router.put('/admin/event/:id/status', MiscPresenter.updateEventStatus);
router.delete('/admin/event/:id', MiscPresenter.deleteEvent);
router.post('/admin/event/:id/results', MiscPresenter.saveEventResults);

// Session
router.post('/logout', MiscPresenter.logout);
router.get('/check-session', MiscPresenter.checkSession);

module.exports = router;
