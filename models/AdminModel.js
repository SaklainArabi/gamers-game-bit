const { query } = require('./db');

class AdminModel {
    static async createAdmin(username, email, password) {
        return await query('INSERT INTO Admin (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
    }

    static async findByCredentials(username, password) {
        const results = await query('SELECT * FROM Admin WHERE username = ? AND password = ?', [username, password]);
        return results.length > 0 ? results[0] : null;
    }

    static async getAllUsers() {
        return await query(`
            SELECT u.user_id, u.username, u.email, u.balance, u.is_restricted, u.created_at
            FROM User u
        `);
    }

    static async restrictUser(userId, restrict) {
        return await query('UPDATE User SET is_restricted = ? WHERE user_id = ?', [restrict, userId]);
    }

    static async getListing(listingId) {
        const results = await query('SELECT * FROM Game_Listing WHERE listing_id = ?', [listingId]);
        return results.length > 0 ? results[0] : null;
    }

    static async approveListing(listingId, approve) {
        return await query('UPDATE Game_Listing SET admin_approved = ? WHERE listing_id = ?', [approve, listingId]);
    }

    static async restockListing(listingId, newStock, gameKey) {
        if (gameKey) {
            return await query('UPDATE Game_Listing SET stock_quantity = ?, status = ?, game_key = ? WHERE listing_id = ?', [newStock, 'AVAILABLE', gameKey, listingId]);
        }
        return await query('UPDATE Game_Listing SET stock_quantity = ?, status = ? WHERE listing_id = ?', [newStock, 'AVAILABLE', listingId]);
    }

    static async getAllListings() {
        return await query(`
            SELECT l.*, u.username as seller_name, c.name as category_name
            FROM Game_Listing l 
            LEFT JOIN User u ON l.seller_id = u.user_id 
            LEFT JOIN Game_Category c ON l.category_id = c.category_id
            ORDER BY l.admin_approved ASC, l.created_at DESC
        `);
    }

    static async createListing(gameName, description, price, gameKey, stockQuantity, categoryId) {
        return await query(
            `INSERT INTO Game_Listing (seller_id, game_name, description, price, game_key, stock_quantity, category_id, admin_approved, featured) 
             VALUES (NULL, ?, ?, ?, ?, ?, ?, true, true)`,
            [gameName, description, price, gameKey, stockQuantity, categoryId]
        );
    }

    static async getBalanceRequests() {
        return await query(`
            SELECT br.*, u.username, u.email 
            FROM Balance_Request br 
            JOIN User u ON br.user_id = u.user_id 
            ORDER BY CASE WHEN br.status = 'PENDING' THEN 1 ELSE 2 END, br.created_at DESC
        `);
    }

    static async getBalanceRequest(requestId) {
        const results = await query('SELECT * FROM Balance_Request WHERE request_id = ?', [requestId]);
        return results.length > 0 ? results[0] : null;
    }

    static async processBalanceRequest(requestId, adminId, status) {
        return await query('UPDATE Balance_Request SET status = ?, processed_at = NOW(), processed_by = ? WHERE request_id = ?',
            [status, adminId, requestId]);
    }

    static async addBalanceToUser(userId, amount) {
        return await query('UPDATE User SET balance = balance + ? WHERE user_id = ?', [amount, userId]);
    }

    static async getDashboardStats() {
        const [totalUsers] = await query('SELECT COUNT(*) as count FROM User');
        const [totalListings] = await query('SELECT COUNT(*) as count FROM Game_Listing');
        const [pendingApprovals] = await query('SELECT COUNT(*) as count FROM Game_Listing WHERE admin_approved = false');
        const [totalPurchases] = await query('SELECT COUNT(*) as count, SUM(purchase_price) as revenue FROM Purchase');
        const [pendingBalanceRequests] = await query("SELECT COUNT(*) as count FROM Balance_Request WHERE status = 'PENDING'");
        
        return {
            totalUsers: totalUsers.count,
            totalListings: totalListings.count,
            pendingApprovals: pendingApprovals.count,
            totalPurchases: totalPurchases.count,
            totalRevenue: totalPurchases.revenue || 0,
            pendingBalanceRequests: pendingBalanceRequests.count
        };
    }
}

module.exports = AdminModel;
