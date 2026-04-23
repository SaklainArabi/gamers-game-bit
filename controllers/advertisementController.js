const AdvertisementModel = require('../models/advertisementModel');

const advertisementController = {
    async getActive(req, res) {
        try {
            const ads = await AdvertisementModel.getActive(req.query.position);
            res.json({ success: true, advertisements: ads });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching ads' });
        }
    },

    async click(req, res) {
        try {
            await AdvertisementModel.incrementClicks(req.params.id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false });
        }
    },

    // Admin
    async create(req, res) {
        const { title, description, imageUrl, linkUrl, listingId, position, startDate, endDate } = req.body;
        const finalImageUrl = imageUrl || `https://via.placeholder.com/1200x300/4f46e5/ffffff?text=${encodeURIComponent(title || 'Advertisement')}`;

        try {
            await AdvertisementModel.create(title, finalImageUrl, linkUrl, listingId, position, startDate, endDate);
            res.json({ success: true, message: 'Advertisement created' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error creating advertisement' });
        }
    },

    async getAll(req, res) {
        try {
            const ads = await AdvertisementModel.getAll();
            res.json({ success: true, advertisements: ads });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching ads' });
        }
    },

    async toggle(req, res) {
        try {
            await AdvertisementModel.toggle(req.params.id);
            res.json({ success: true, message: 'Advertisement toggled' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error toggling ad' });
        }
    },

    async deleteAd(req, res) {
        try {
            await AdvertisementModel.deleteAd(req.params.id);
            res.json({ success: true, message: 'Advertisement deleted' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error deleting advertisement' });
        }
    }
};

module.exports = advertisementController;
