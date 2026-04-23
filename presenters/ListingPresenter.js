const ListingModel = require('../models/ListingModel');
const { query } = require('../models/db');

class ListingPresenter {
    // Categories
    static async getCategories(req, res) {
        try {
            const categories = await ListingModel.getCategories();
            res.json({ success: true, categories });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching categories' });
        }
    }

    static async createCategory(req, res) {
        if (!req.session.user || req.session.user.type !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const { name, description, icon } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Category name is required' });
        try {
            await ListingModel.createCategory(name, description, icon);
            res.json({ success: true, message: 'Category created successfully' });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Category already exists' });
            res.status(500).json({ success: false, message: 'Error creating category' });
        }
    }

    static async deleteCategory(req, res) {
        if (!req.session.user || req.session.user.type !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        try {
            await ListingModel.deleteCategory(req.params.id);
            res.json({ success: true, message: 'Category deleted' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error deleting category' });
        }
    }

    // Listings
    static async createListing(req, res) {
        if (!req.session.user || req.session.user.type !== 'user') {
            return res.status(401).json({ success: false, message: 'User login required' });
        }
        const { gameName, description, price, gameKey, categoryId, stockQuantity } = req.body;
        try {
            await ListingModel.createListing(req.session.user.id, gameName, description, price, gameKey, stockQuantity || 1, categoryId || null);
            res.json({ success: true, message: 'Listing created. Waiting for admin approval.' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error creating listing' });
        }
    }

    static async getListings(req, res) {
        const { category, minPrice, maxPrice, sort, featured } = req.query;
        try {
            const listings = await ListingModel.getListings(category, minPrice, maxPrice, sort, featured);
            res.json({ success: true, listings });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching listings' });
        }
    }

    static async getListingDetail(req, res) {
        try {
            const listing = await ListingModel.getListingDetail(req.params.id);
            if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
            const reviews = await ListingModel.getReviews(req.params.id);
            res.json({ success: true, listing, reviews });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching listing' });
        }
    }

    static async getMyListings(req, res) {
        if (!req.session.user || req.session.user.type !== 'user') return res.status(401).json({ success: false, message: 'User login required' });
        try {
            const listings = await ListingModel.getMyListings(req.session.user.id);
            res.json({ success: true, listings });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching listings' });
        }
    }

    static async restock(req, res) {
        if (!req.session.user || req.session.user.type !== 'user') return res.status(401).json({ success: false, message: 'User login required' });
        const { listingId, quantity, gameKey } = req.body;
        if (!quantity || quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        try {
            const result = await ListingModel.restockListing(listingId, req.session.user.id, quantity, gameKey);
            if (!result) return res.status(404).json({ success: false, message: 'Listing not found or you are not the seller' });
            res.json({ success: true, message: 'Successfully restocked copies.' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error restocking game' });
        }
    }

    static async buy(req, res) {
        if (!req.session.user || req.session.user.type !== 'user') return res.status(401).json({ success: false, message: 'User login required' });
        const { listingId } = req.body;
        try {
            const listings = await query('SELECT * FROM Game_Listing WHERE listing_id = ?', [listingId]);
            if (listings.length === 0) return res.status(404).json({ success: false, message: 'Listing not found' });
            const listing = listings[0];
            if (listing.stock_quantity <= 0 || listing.status === 'OUT_OF_STOCK') return res.status(400).json({ success: false, message: 'Game is out of stock' });
            if (listing.seller_id && listing.seller_id === req.session.user.id) return res.status(400).json({ success: false, message: 'Cannot buy your own listing' });
            if (!listing.admin_approved) return res.status(400).json({ success: false, message: 'Listing not approved' });
            
            const existingPurchase = await query('SELECT * FROM Purchase WHERE buyer_id = ? AND listing_id = ?', [req.session.user.id, listingId]);
            if (existingPurchase.length > 0) return res.status(400).json({ success: false, message: 'You already own this game' });
            
            const finalPrice = listing.price;
            
            const users = await query('SELECT balance FROM User WHERE user_id = ?', [req.session.user.id]);
            if (users[0].balance < finalPrice) return res.status(400).json({ success: false, message: 'Insufficient balance' });
            
            const newStock = listing.stock_quantity - 1;
            const newStatus = newStock <= 0 ? 'OUT_OF_STOCK' : 'AVAILABLE';
            await query('UPDATE Game_Listing SET stock_quantity = ?, status = ? WHERE listing_id = ?', [newStock, newStatus, listingId]);
            await query('UPDATE User SET balance = balance - ? WHERE user_id = ?', [finalPrice, req.session.user.id]);
            
            if (listing.seller_id) {
                await query('UPDATE User SET balance = balance + ? WHERE user_id = ?', [listing.price, listing.seller_id]);
            }
            
            await query('INSERT INTO Purchase (buyer_id, listing_id, purchase_price) VALUES (?, ?, ?)', [req.session.user.id, listingId, finalPrice]);
            
            res.json({ success: true, message: 'Purchase successful', gameKey: listing.game_key, finalPrice });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error processing purchase' });
        }
    }

    static async getPurchases(req, res) {
        if (!req.session.user || req.session.user.type !== 'user') return res.status(401).json({ success: false, message: 'User login required' });
        try {
            const purchases = await query(`
                SELECT p.*, l.game_name, l.description, l.game_key, c.name as category_name
                FROM Purchase p 
                JOIN Game_Listing l ON p.listing_id = l.listing_id 
                LEFT JOIN Game_Category c ON l.category_id = c.category_id
                WHERE p.buyer_id = ? 
                ORDER BY p.purchase_date DESC
            `, [req.session.user.id]);
            res.json({ success: true, purchases });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching purchases' });
        }
    }

    // Reviews
    static async createReview(req, res) {
        if (!req.session.user || req.session.user.type !== 'user') return res.status(401).json({ success: false, message: 'User login required' });
        const { rating, reviewText } = req.body;
        if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
        try {
            const result = await ListingModel.createReview(req.params.id, req.session.user.id, rating, reviewText);
            if (!result) return res.status(400).json({ success: false, message: 'You can only review games you purchased' });
            res.json({ success: true, message: 'Review submitted' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error submitting review' });
        }
    }

    static async getReviews(req, res) {
        try {
            const reviews = await ListingModel.getReviews(req.params.id);
            res.json({ success: true, reviews });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching reviews' });
        }
    }
}

module.exports = ListingPresenter;
