const UserModel = require('../models/userModel');
const ReferralModel = require('../models/referralModel');
const NotificationModel = require('../models/notificationModel');
const WishlistModel = require('../models/wishlistModel');
const PurchaseModel = require('../models/purchaseModel');
const ReviewModel = require('../models/reviewModel');
const CommunityModel = require('../models/communityModel');
const EventModel = require('../models/eventModel');
const SubscriptionModel = require('../models/subscriptionModel');
const BalanceRequestModel = require('../models/balanceRequestModel');
const HelpModel = require('../models/helpModel');
const ListingModel = require('../models/listingModel');
const AdvertisementModel = require('../models/advertisementModel');
const { sendNotification } = require('../utils/notification');

const userController = {
    // User Registration (with referral support)
    async register(req, res) {
        const { username, email, password, referralCode } = req.body;
        
        try {
            // Validate input
            if (!username || !email || !password) {
                return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
            }

            // Check if user already exists
            const existingUser = await UserModel.checkUserExists(username, email);
            if (existingUser.length > 0) {
                const existing = existingUser[0];
                const field = existing.username === username ? 'Username' : 'Email';
                return res.status(400).json({ success: false, message: `${field} already in use` });
            }
            
            let referredBy = null;
            if (referralCode) {
                const referrer = await UserModel.findByReferralCode(referralCode);
                if (referrer.length > 0) {
                    referredBy = referrer[0].user_id;
                } else {
                    return res.status(400).json({ success: false, message: 'Invalid referral code' });
                }
            }
            
            const initialBalance = referredBy ? 200 : 0;
            
            const result = await UserModel.create(username, email, password, referredBy, initialBalance);
            
            if (referredBy) {
                await UserModel.addBalance(referredBy, 100);
                
                await ReferralModel.create(referredBy, result.insertId, 100.00);
                
                await sendNotification(result.insertId, 'REFERRAL',
                    'Welcome Bonus!',
                    'You received $200 bonus for using a referral code! Start shopping now!',
                    '/user-dashboard'
                );
                
                await sendNotification(referredBy, 'REFERRAL',
                    'Referral Bonus!',
                    `${username} signed up using your referral code! You earned $100 bonus!`,
                    '/user-dashboard'
                );
            }
            
            res.json({ 
                success: true, 
                message: referredBy ? 'Registration successful! You received $200 welcome bonus!' : 'Registration successful' 
            });
        } catch (err) {
            console.error('Registration error:', err);
            res.status(500).json({ success: false, message: 'Server error during registration' });
        }
    },

    // User Login
    async login(req, res) {
        const { username, password } = req.body;
        
        try {
            const results = await UserModel.findByCredentials(username, password);
            
            if (results.length === 0) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
            
            if (results[0].is_restricted) {
                return res.status(403).json({ success: false, message: 'Your account has been restricted' });
            }
            
            req.session.user = {
                id: results[0].user_id,
                username: results[0].username,
                type: 'user'
            };
            res.json({ success: true, message: 'Login successful', user: req.session.user });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // Get User Profile
    async getProfile(req, res) {
        try {
            const results = await UserModel.findById(req.session.user.id);
            
            if (results.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            res.json({ success: true, user: results[0] });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // Update User Profile
    async updateProfile(req, res) {
        const { bio, profile_picture, language_preference } = req.body;
        
        try {
            await UserModel.updateProfile(req.session.user.id, bio, profile_picture, language_preference);
            res.json({ success: true, message: 'Profile updated' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error updating profile' });
        }
    },

    // Delete Account
    async deleteAccount(req, res) {
        const userId = req.session.user.id;
        
        try {
            const userListings = await ListingModel.getSellerListingIds(userId);
            const listingIds = userListings.map(l => l.listing_id);
            
            if (listingIds.length > 0) {
                await AdvertisementModel.deleteByListingIds(listingIds);
                await ReviewModel.deleteByListingIds(listingIds);
                await WishlistModel.deleteByListingIds(listingIds);
                await PurchaseModel.deleteByListingIds(listingIds);
            }
            
            await NotificationModel.deleteByUser(userId);
            await HelpModel.deleteChatByUser(userId);
            await WishlistModel.deleteByUser(userId);
            await PurchaseModel.deleteByBuyer(userId);
            await CommunityModel.deleteThreadUpvotesByUser(userId);
            await CommunityModel.deleteCommentUpvotesByUser(userId);
            await CommunityModel.deleteCommentsByUser(userId);
            await CommunityModel.deleteThreadsByUser(userId);
            await ReviewModel.deleteByUser(userId);
            await EventModel.deleteRegistrationsByUser(userId);
            await SubscriptionModel.deleteByUser(userId);
            await BalanceRequestModel.deleteByUser(userId);
            await HelpModel.deleteQuestionsByUser(userId);
            
            await ListingModel.deleteBySeller(userId);
            
            await ReferralModel.deleteByUser(userId);
            await UserModel.clearReferredBy(userId);
            await UserModel.deleteUser(userId);
            
            req.session.destroy();
            res.json({ success: true, message: 'Account deleted successfully' });
        } catch (err) {
            console.error('Delete account error:', err);
            res.status(500).json({ success: false, message: 'Error deleting account: ' + err.message });
        }
    },

    // Get User Notifications
    async getNotifications(req, res) {
        try {
            const notifications = await NotificationModel.getByUser(req.session.user.id);
            res.json({ success: true, notifications });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching notifications' });
        }
    },

    // Mark Notification as Read
    async markNotificationRead(req, res) {
        try {
            await NotificationModel.markRead(req.params.id, req.session.user.id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error' });
        }
    },

    // Mark All Notifications as Read
    async markAllNotificationsRead(req, res) {
        try {
            await NotificationModel.markAllRead(req.session.user.id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error' });
        }
    }
};

module.exports = userController;
