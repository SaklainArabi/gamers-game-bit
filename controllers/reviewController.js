const ReviewModel = require('../models/reviewModel');
const PurchaseModel = require('../models/purchaseModel');

const reviewController = {
    async create(req, res) {
        const { rating, reviewText } = req.body;
        const listingId = req.params.id;
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
        }
        
        try {
            const purchases = await PurchaseModel.findByBuyerAndListing(req.session.user.id, listingId);
            
            if (purchases.length === 0) {
                return res.status(400).json({ success: false, message: 'You can only review games you purchased' });
            }
            
            await ReviewModel.createOrUpdate(listingId, req.session.user.id, rating, reviewText);
            res.json({ success: true, message: 'Review submitted' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error submitting review' });
        }
    },

    async getByListing(req, res) {
        try {
            const reviews = await ReviewModel.getByListing(req.params.id);
            res.json({ success: true, reviews });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching reviews' });
        }
    }
};

module.exports = reviewController;
