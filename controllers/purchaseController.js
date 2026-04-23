const ListingModel = require('../models/listingModel');
const PurchaseModel = require('../models/purchaseModel');
const UserModel = require('../models/userModel');
const SubscriptionModel = require('../models/subscriptionModel');
const ReferralModel = require('../models/referralModel');
const BalanceRequestModel = require('../models/balanceRequestModel');
const { sendNotification } = require('../utils/notification');

const purchaseController = {
    // Buy a game
    async buy(req, res) {
        const { listingId } = req.body;
        
        try {
            const listings = await ListingModel.findById(listingId);
            if (listings.length === 0) {
                return res.status(404).json({ success: false, message: 'Listing not found' });
            }
            
            const listing = listings[0];
            
            if (listing.stock_quantity <= 0 || listing.status === 'OUT_OF_STOCK') {
                return res.status(400).json({ success: false, message: 'Game is out of stock' });
            }
            if (listing.seller_id && listing.seller_id === req.session.user.id) {
                return res.status(400).json({ success: false, message: 'Cannot buy your own listing' });
            }
            if (!listing.admin_approved) {
                return res.status(400).json({ success: false, message: 'Listing not approved' });
            }
            
            const existingPurchase = await PurchaseModel.findByBuyerAndListing(req.session.user.id, listingId);
            if (existingPurchase.length > 0) {
                return res.status(400).json({ success: false, message: 'You already own this game' });
            }
            
            const subscriptions = await SubscriptionModel.getActive(req.session.user.id);
            
            let discount = 0;
            if (subscriptions.length > 0) {
                discount = subscriptions[0].discount_percentage;
            }
            
            const finalPrice = listing.price * (1 - discount / 100);
            
            const users = await UserModel.getBalance(req.session.user.id);
            if (users[0].balance < finalPrice) {
                return res.status(400).json({ success: false, message: 'Insufficient balance' });
            }
            
            const newStock = listing.stock_quantity - 1;
            const newStatus = newStock <= 0 ? 'OUT_OF_STOCK' : 'AVAILABLE';
            await ListingModel.updateStock(listingId, newStock, newStatus, null);
            await UserModel.deductBalance(req.session.user.id, finalPrice);
            
            if (listing.seller_id) {
                await UserModel.addBalance(listing.seller_id, listing.price);
                await sendNotification(listing.seller_id, 'SALE',
                    'Game Sold!',
                    `Your game "${listing.game_name}" was sold for $${listing.price}!`,
                    '/user-dashboard'
                );
            }
            
            await PurchaseModel.create(req.session.user.id, listingId, finalPrice, listing.price, discount);
            
            const referrals = await ReferralModel.getPendingByUser(req.session.user.id);
            if (referrals.length > 0) {
                const referral = referrals[0];
                await UserModel.addBalance(referral.referrer_id, referral.bonus_amount);
                await UserModel.addBalance(referral.referred_id, referral.bonus_amount);
                await ReferralModel.complete(referral.referral_id);
                
                await sendNotification(referral.referrer_id, 'REFERRAL',
                    'Referral Bonus!',
                    `Your referral made a purchase! You earned $${referral.bonus_amount} bonus!`,
                    '/user-dashboard'
                );
            }
            
            await sendNotification(req.session.user.id, 'PURCHASE',
                'Purchase Successful!',
                `You purchased "${listing.game_name}"${discount > 0 ? ` with ${discount}% subscriber discount!` : ''}`,
                '/user-dashboard'
            );
            
            res.json({ success: true, message: 'Purchase successful', gameKey: listing.game_key, finalPrice, discount });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error processing purchase' });
        }
    },

    // Get User Purchases
    async getMyPurchases(req, res) {
        try {
            const purchases = await PurchaseModel.getByBuyer(req.session.user.id);
            res.json({ success: true, purchases });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching purchases' });
        }
    },

    // Request Balance
    async requestBalance(req, res) {
        const { amount } = req.body;
        
        if (amount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
        }
        
        try {
            const { notifyAdmins } = require('../utils/notification');
            await BalanceRequestModel.create(req.session.user.id, amount);
            notifyAdmins('BALANCE', 'New Balance Request', `User requested $${amount}`);
            res.json({ success: true, message: 'Balance request submitted' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error creating request' });
        }
    },

    // Get User Balance Requests
    async getBalanceRequests(req, res) {
        try {
            const requests = await BalanceRequestModel.getByUser(req.session.user.id);
            res.json({ success: true, requests });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching requests' });
        }
    },

    // Leaderboard
    async getLeaderboard(req, res) {
        const { query } = require('../config/db');
        try {
            const leaderboard = await query(`
                SELECT user_id, username, total_sales, 
                       (SELECT COUNT(*) FROM Game_Listing WHERE seller_id = u.user_id AND status = 'SOLD') as games_sold
                FROM User u 
                WHERE total_sales > 0 
                ORDER BY total_sales DESC 
                LIMIT 50
            `);
            res.json({ success: true, leaderboard });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
        }
    }
};

module.exports = purchaseController;
