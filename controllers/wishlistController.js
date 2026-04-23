const WishlistModel = require('../models/wishlistModel');
const { notifyAdmins } = require('../utils/notification');

const wishlistController = {
    async add(req, res) {
        const { gameName, listingId } = req.body;
        
        try {
            const existing = await WishlistModel.findExisting(req.session.user.id, listingId, gameName);
            
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'This game is already in your wishlist' });
            }
            
            await WishlistModel.add(req.session.user.id, gameName, listingId);
            notifyAdmins('WISHLIST', 'New Wishlist Request', `User wants: "${gameName}"`);
            
            res.json({ success: true, message: 'Added to wishlist' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error adding to wishlist' });
        }
    },

    async getByUser(req, res) {
        try {
            const wishlist = await WishlistModel.getByUser(req.session.user.id);
            res.json({ success: true, wishlist });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching wishlist' });
        }
    },

    async remove(req, res) {
        try {
            await WishlistModel.remove(req.params.id, req.session.user.id);
            res.json({ success: true, message: 'Removed from wishlist' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error removing from wishlist' });
        }
    },

    async getForAdmin(req, res) {
        try {
            const wishlists = await WishlistModel.getUnfulfilledForAdmin();
            res.json({ success: true, wishlists });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching wishlists' });
        }
    }
};

module.exports = wishlistController;
