const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { requireUser, requireAdmin } = require('../middleware/auth');

router.post('/wishlist/add', requireUser, wishlistController.add);
router.get('/user/wishlist', requireUser, wishlistController.getByUser);
router.delete('/wishlist/:id', requireUser, wishlistController.remove);
router.get('/admin/wishlists', requireAdmin, wishlistController.getForAdmin);

module.exports = router;
