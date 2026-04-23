const AdminModel = require('../models/adminModel');
const UserModel = require('../models/userModel');
const ListingModel = require('../models/listingModel');
const WishlistModel = require('../models/wishlistModel');
const BalanceRequestModel = require('../models/balanceRequestModel');
const SubscriptionModel = require('../models/subscriptionModel');
const HelpModel = require('../models/helpModel');
const CategoryModel = require('../models/categoryModel');
const { query } = require('../config/db');
const { sendNotification, notifyAdmins } = require('../utils/notification');

const adminController = {
    // Admin Registration
    async register(req, res) {
        const { username, email, password } = req.body;
        
        try {
            if (!username || !email || !password) {
                return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
            }

            // Check if admin already exists
            const existing = await query('SELECT admin_id, username, email FROM Admin WHERE username = ? OR email = ?', [username, email]);
            if (existing.length > 0) {
                const field = existing[0].username === username ? 'Username' : 'Email';
                return res.status(400).json({ success: false, message: `${field} already in use` });
            }

            await AdminModel.create(username, email, password);
            res.json({ success: true, message: 'Admin registration successful' });
        } catch (err) {
            console.error('Admin registration error:', err);
            res.status(500).json({ success: false, message: 'Server error during registration' });
        }
    },

    // Admin Login
    async login(req, res) {
        const { username, password } = req.body;
        
        try {
            const results = await AdminModel.findByCredentials(username, password);
            
            if (results.length === 0) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
            
            req.session.user = {
                id: results[0].admin_id,
                username: results[0].username,
                type: 'admin'
            };
            res.json({ success: true, message: 'Admin login successful', user: req.session.user });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // Get All Users
    async getUsers(req, res) {
        try {
            const users = await UserModel.getAllUsers();
            res.json({ success: true, users });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching users' });
        }
    },

    // Restrict/Unrestrict User
    async restrictUser(req, res) {
        const { userId, restrict } = req.body;
        
        try {
            await UserModel.setRestricted(userId, restrict);
            await sendNotification(userId, 'SYSTEM', 
                restrict ? 'Account Restricted' : 'Account Unrestricted',
                restrict ? 'Your account has been restricted by an administrator.' : 'Your account has been unrestricted.');
            res.json({ success: true, message: restrict ? 'User restricted' : 'User unrestricted' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error updating user' });
        }
    },

    // Approve/Disapprove Listing
    async approveListing(req, res) {
        const { listingId, approve } = req.body;
        
        try {
            const listing = await ListingModel.findById(listingId);
            if (listing.length === 0) {
                return res.status(404).json({ success: false, message: 'Listing not found' });
            }
            
            await ListingModel.setApproval(listingId, approve);
            
            if (listing[0].seller_id) {
                await sendNotification(listing[0].seller_id, 'APPROVAL',
                    approve ? 'Listing Approved!' : 'Listing Rejected',
                    approve ? `Your game "${listing[0].game_name}" has been approved and is now live!` 
                            : `Your game "${listing[0].game_name}" was not approved.`,
                    '/user-dashboard'
                );
                
                if (approve) {
                    const wishlists = await WishlistModel.findByGameName(listing[0].game_name);
                    
                    for (const wish of wishlists) {
                        await sendNotification(wish.user_id, 'WISHLIST',
                            'Wishlist Game Available!',
                            `"${listing[0].game_name}" is now available for purchase!`,
                            '/user-dashboard'
                        );
                        await WishlistModel.linkListing(wish.wishlist_id, listingId);
                    }
                }
            }
            
            res.json({ success: true, message: approve ? 'Listing approved' : 'Listing disapproved' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error updating listing' });
        }
    },

    // Restock a game
    async restock(req, res) {
        const { listingId, quantity, gameKey } = req.body;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        }
        
        try {
            const listing = await ListingModel.findById(listingId);
            if (listing.length === 0) {
                return res.status(404).json({ success: false, message: 'Listing not found' });
            }
            
            const newStock = listing[0].stock_quantity + parseInt(quantity);
            await ListingModel.updateStock(listingId, newStock, 'AVAILABLE', gameKey);
            
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

    // Get All Listings
    async getListings(req, res) {
        try {
            const listings = await ListingModel.getAllForAdmin();
            res.json({ success: true, listings });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching listings' });
        }
    },

    // Create Game Listing
    async createListing(req, res) {
        const { gameName, description, price, gameKey, categoryId, trailerUrl, screenshots, stockQuantity } = req.body;
        
        try {
            await ListingModel.createByAdmin(gameName, description, price, gameKey, stockQuantity, categoryId, trailerUrl, screenshots);
            res.json({ success: true, message: 'Admin listing created successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error creating listing' });
        }
    },

    // Get All Balance Requests
    async getBalanceRequests(req, res) {
        try {
            const requests = await BalanceRequestModel.getAllForAdmin();
            res.json({ success: true, requests });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching balance requests' });
        }
    },

    // Process Balance Request
    async processBalanceRequest(req, res) {
        const { requestId, approve } = req.body;
        
        try {
            const requests = await BalanceRequestModel.findById(requestId);
            if (requests.length === 0) {
                return res.status(404).json({ success: false, message: 'Request not found' });
            }
            
            const request = requests[0];
            if (request.status !== 'PENDING') {
                return res.status(400).json({ success: false, message: 'Request already processed' });
            }
            
            const status = approve ? 'APPROVED' : 'REJECTED';
            await BalanceRequestModel.process(requestId, status, req.session.user.id);
            
            if (approve) {
                await UserModel.addBalance(request.user_id, request.amount);
            }
            
            await sendNotification(request.user_id, 'SYSTEM',
                approve ? 'Balance Added!' : 'Balance Request Rejected',
                approve ? `$${request.amount} has been added to your account.` : 'Your balance request was rejected.',
                '/user-dashboard'
            );
            
            res.json({ success: true, message: approve ? 'Balance approved' : 'Balance rejected' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error processing request' });
        }
    },

    // Get Dashboard Stats
    async getStats(req, res) {
        try {
            const [totalUsers] = await query('SELECT COUNT(*) as count FROM User');
            const [totalListings] = await query('SELECT COUNT(*) as count FROM Game_Listing');
            const [pendingApprovals] = await query('SELECT COUNT(*) as count FROM Game_Listing WHERE admin_approved = false');
            const [totalPurchases] = await PurchaseModel.getStats();
            const [activeSubscriptions] = await SubscriptionModel.getActiveCount();
            const [pendingBalanceRequests] = await BalanceRequestModel.getPendingCount();
            const [unansweredQuestions] = await HelpModel.getUnansweredCount();
            
            res.json({
                success: true,
                stats: {
                    totalUsers: totalUsers.count,
                    totalListings: totalListings.count,
                    pendingApprovals: pendingApprovals.count,
                    totalPurchases: totalPurchases.count,
                    totalRevenue: totalPurchases.revenue || 0,
                    activeSubscriptions: activeSubscriptions.count,
                    pendingBalanceRequests: pendingBalanceRequests.count,
                    unansweredQuestions: unansweredQuestions.count
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching stats' });
        }
    }
};

module.exports = adminController;
