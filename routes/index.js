const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const adminRoutes = require('./adminRoutes');
const listingRoutes = require('./listingRoutes');
const communityRoutes = require('./communityRoutes');
const miscRoutes = require('./miscRoutes');

router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/community', communityRoutes);
router.use('/', miscRoutes);
router.use('/', listingRoutes);

module.exports = router;
