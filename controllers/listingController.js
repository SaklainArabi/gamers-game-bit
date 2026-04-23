const ListingModel = require('../models/listingModel');
const CategoryModel = require('../models/categoryModel');
const { notifyAdmins } = require('../utils/notification');

const listingController = {
    // Create Listing (User)
    async create(req, res) {
        const { gameName, description, price, gameKey, categoryId, trailerUrl, screenshots, stockQuantity } = req.body;
        
        try {
            await ListingModel.create(req.session.user.id, gameName, description, price, gameKey, stockQuantity, categoryId, trailerUrl, screenshots);
            
            notifyAdmins('NEW_LISTING', 'New Listing Pending', `"${gameName}" needs approval`);
            res.json({ success: true, message: 'Listing created. Waiting for admin approval.' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error creating listing' });
        }
    },

    // Get All Approved Listings
    async getAll(req, res) {
        try {
            const listings = await ListingModel.getApprovedListings(req.query);
            res.json({ success: true, listings });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching listings' });
        }
    },

    // Search games
    async search(req, res) {
        const { q } = req.query;
        
        if (!q || !q.trim()) {
            return res.json({ success: true, results: [] });
        }
        
        try {
            const results = await ListingModel.search(q);
            res.json({ success: true, results });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error searching games' });
        }
    },

    // Get Single Listing
    async getById(req, res) {
        try {
            await ListingModel.incrementViewCount(req.params.id);
            
            const listings = await ListingModel.findByIdWithDetails(req.params.id);
            
            if (listings.length === 0) {
                return res.status(404).json({ success: false, message: 'Listing not found' });
            }
            
            const ReviewModel = require('../models/reviewModel');
            const reviews = await ReviewModel.getByListing(req.params.id);
            
            res.json({ success: true, listing: listings[0], reviews });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching listing' });
        }
    },

    // Get My Listings (User)
    async getMyListings(req, res) {
        try {
            const listings = await ListingModel.getBySellerWithCategory(req.session.user.id);
            res.json({ success: true, listings });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching listings' });
        }
    },

    // Restock own game (Seller)
    async userRestock(req, res) {
        const { listingId, quantity, gameKey } = req.body;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        }
        
        try {
            const listing = await ListingModel.findByIdAndSeller(listingId, req.session.user.id);
            
            if (listing.length === 0) {
                return res.status(404).json({ success: false, message: 'Listing not found or you are not the seller' });
            }
            
            const newStock = listing[0].stock_quantity + parseInt(quantity);
            await ListingModel.updateStock(listingId, newStock, 'AVAILABLE', gameKey);
            
            const WishlistModel = require('../models/wishlistModel');
            const { sendNotification } = require('../utils/notification');
            const wishlists = await WishlistModel.findByListingId(listingId);
            
            for (const wish of wishlists) {
                await sendNotification(wish.user_id, 'WISHLIST',
                    'Game Back in Stock!',
                    `"${listing[0].game_name}" is back in stock! Grab it now!`,
                    `/game/${listingId}`
                );
                await WishlistModel.markNotified(wish.wishlist_id);
            }
            
            res.json({ success: true, message: `Successfully restocked ${quantity} copies. New stock: ${newStock}` });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error restocking game' });
        }
    },

    // Compare Games
    async compare(req, res) {
        const { listingIds } = req.body;
        
        if (!listingIds || listingIds.length < 2 || listingIds.length > 4) {
            return res.status(400).json({ success: false, message: 'Select 2-4 games to compare' });
        }
        
        try {
            const games = await ListingModel.compareGames(listingIds);
            res.json({ success: true, games });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error comparing games' });
        }
    },

    // Get Categories
    async getCategories(req, res) {
        try {
            const categories = await CategoryModel.getAll();
            res.json({ success: true, categories });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching categories' });
        }
    },

    // Create Category (Admin)
    async createCategory(req, res) {
        const { name, description, icon } = req.body;
        
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }
        
        try {
            await CategoryModel.create(name, description, icon);
            res.json({ success: true, message: 'Category created successfully' });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Category already exists' });
            }
            res.status(500).json({ success: false, message: 'Error creating category' });
        }
    },

    // Delete Category (Admin)
    async deleteCategory(req, res) {
        try {
            await ListingModel.clearCategoryId(req.params.id);
            await CategoryModel.deleteCategory(req.params.id);
            res.json({ success: true, message: 'Category deleted' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error deleting category' });
        }
    }
};

module.exports = listingController;
