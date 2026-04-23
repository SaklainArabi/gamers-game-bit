const AdminModel = require('../models/AdminModel');

class AdminPresenter {
    static async register(req, res) {
        const { username, email, password } = req.body;
        try {
            await AdminModel.createAdmin(username, email, password);
            res.json({ success: true, message: 'Admin registration successful' });
        } catch (err) {
            res.status(400).json({ success: false, message: 'Username or email already exists' });
        }
    }

    static async login(req, res) {
        const { username, password } = req.body;
        try {
            const admin = await AdminModel.findByCredentials(username, password);
            if (!admin) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
            req.session.user = {
                id: admin.admin_id,
                username: admin.username,
                type: 'admin'
            };
            res.json({ success: true, message: 'Admin login successful', user: req.session.user });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    static async getUsers(req, res) {
        if (!req.session.user || req.session.user.type !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        try {
            const users = await AdminModel.getAllUsers();
            res.json({ success: true, users });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching users' });
        }
    }

    static async restrictUser(req, res) {
        if (!req.session.user || req.session.user.type !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const { userId, restrict } = req.body;
        try {
            await AdminModel.restrictUser(userId, restrict);
            res.json({ success: true, message: restrict ? 'User restricted' : 'User unrestricted' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error updating user' });
        }
    }

    static async approveListing(req, res) {
        if (!req.session.user || req.session.user.type !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const { listingId, approve } = req.body;
        try {
            const listing = await AdminModel.getListing(listingId);
            if (!listing) {
                return res.status(404).json({ success: false, message: 'Listing not found' });
            }
            
            await AdminModel.approveListing(listingId, approve);
            res.json({ success: true, message: approve ? 'Listing approved' : 'Listing disapproved' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error updating listing' });
        }
    }

    static async restock(req, res) {
        if (!req.session.user || req.session.user.type !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const { listingId, quantity, gameKey } = req.body;
        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        }
        try {
            const listing = await AdminModel.getListing(listingId);
            if (!listing) {
                return res.status(404).json({ success: false, message: 'Listing not found' });
            }
            const newStock = listing.stock_quantity + parseInt(quantity);
            await AdminModel.restockListing(listingId, newStock, gameKey);
            res.json({ success: true, message: `Successfully restocked ${quantity} copies. New stock: ${newStock}` });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error restocking game' });
        }
    }

    static async getListings(req, res) {
        if (!req.session.user || req.session.user.type !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        try {
            const listings = await AdminModel.getAllListings();
            res.json({ success: true, listings });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching listings' });
        }
    }

    static async createListing(req, res) {
        if (!req.session.user || req.session.user.type !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const { gameName, description, price, gameKey, categoryId, stockQuantity } = req.body;
        try {
            await AdminModel.createListing(gameName, description, price, gameKey, stockQuantity || 10, categoryId || null);
            res.json({ success: true, message: 'Admin listing created successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error creating listing' });
        }
    }

    static async getBalanceRequests(req, res) {
        if (!req.session.user || req.session.user.type !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        try {
            const requests = await AdminModel.getBalanceRequests();
            res.json({ success: true, requests });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching balance requests' });
        }
    }

    static async processBalanceRequest(req, res) {
        if (!req.session.user || req.session.user.type !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const { requestId, approve } = req.body;
        try {
            const request = await AdminModel.getBalanceRequest(requestId);
            if (!request) {
                return res.status(404).json({ success: false, message: 'Request not found' });
            }
            if (request.status !== 'PENDING') {
                return res.status(400).json({ success: false, message: 'Request already processed' });
            }
            
            const status = approve ? 'APPROVED' : 'REJECTED';
            await AdminModel.processBalanceRequest(requestId, req.session.user.id, status);
            
            if (approve) {
                await AdminModel.addBalanceToUser(request.user_id, request.amount);
            }
            
            res.json({ success: true, message: approve ? 'Balance approved' : 'Balance rejected' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error processing request' });
        }
    }

    static async getStats(req, res) {
        if (!req.session.user || req.session.user.type !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        try {
            const stats = await AdminModel.getDashboardStats();
            res.json({ success: true, stats });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching stats' });
        }
    }
}

module.exports = AdminPresenter;
