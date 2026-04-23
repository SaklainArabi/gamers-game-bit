const { query } = require('../config/db');

const ListingModel = {
    async create(sellerId, gameName, description, price, gameKey, stockQuantity, categoryId, trailerUrl, screenshots) {
        return query(
            `INSERT INTO Game_Listing (seller_id, game_name, description, price, game_key, stock_quantity, category_id, trailer_url, screenshots) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [sellerId, gameName, description, price, gameKey, stockQuantity || 1, categoryId || null, trailerUrl || null, JSON.stringify(screenshots || [])]
        );
    },

    async createByAdmin(gameName, description, price, gameKey, stockQuantity, categoryId, trailerUrl, screenshots) {
        return query(
            `INSERT INTO Game_Listing (seller_id, game_name, description, price, game_key, stock_quantity, category_id, trailer_url, screenshots, admin_approved, featured) 
             VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, true, true)`,
            [gameName, description, price, gameKey, stockQuantity || 10, categoryId || null, trailerUrl || null, JSON.stringify(screenshots || [])]
        );
    },

    async findById(listingId) {
        return query('SELECT * FROM Game_Listing WHERE listing_id = ?', [listingId]);
    },

    async findByIdWithDetails(listingId) {
        return query(`
            SELECT l.*, COALESCE(u.username, 'Admin Store') as seller_name, c.name as category_name
            FROM Game_Listing l 
            LEFT JOIN User u ON l.seller_id = u.user_id 
            LEFT JOIN Game_Category c ON l.category_id = c.category_id
            WHERE l.listing_id = ?
        `, [listingId]);
    },

    async findByIdAndSeller(listingId, sellerId) {
        return query('SELECT * FROM Game_Listing WHERE listing_id = ? AND seller_id = ?', [listingId, sellerId]);
    },

    async getApprovedListings(filters) {
        const { category, minPrice, maxPrice, sort, search, featured } = filters;
        
        let sql = `
            SELECT l.*, COALESCE(u.username, 'Admin Store') as seller_name, c.name as category_name, c.icon as category_icon
            FROM Game_Listing l 
            LEFT JOIN User u ON l.seller_id = u.user_id 
            LEFT JOIN Game_Category c ON l.category_id = c.category_id
            WHERE l.admin_approved = true AND (l.status = 'AVAILABLE' OR l.status = 'OUT_OF_STOCK')
        `;
        const params = [];
        
        if (category) { sql += ' AND l.category_id = ?'; params.push(category); }
        if (minPrice) { sql += ' AND l.price >= ?'; params.push(minPrice); }
        if (maxPrice) { sql += ' AND l.price <= ?'; params.push(maxPrice); }
        if (search) { sql += ' AND (l.game_name LIKE ? OR l.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        if (featured === 'true') { sql += ' AND l.featured = true'; }
        
        switch (sort) {
            case 'price_low': sql += ' ORDER BY l.price ASC'; break;
            case 'price_high': sql += ' ORDER BY l.price DESC'; break;
            case 'rating': sql += ' ORDER BY l.rating_avg DESC'; break;
            case 'popular': sql += ' ORDER BY l.view_count DESC'; break;
            default: sql += ' ORDER BY l.featured DESC, l.created_at DESC';
        }
        
        return query(sql, params);
    },

    async search(q) {
        return query(`
            SELECT l.*, COALESCE(u.username, 'Admin Store') as seller_name, c.name as category_name, c.icon as category_icon
            FROM Game_Listing l 
            LEFT JOIN User u ON l.seller_id = u.user_id 
            LEFT JOIN Game_Category c ON l.category_id = c.category_id
            WHERE l.admin_approved = true 
              AND (l.status = 'AVAILABLE' OR l.status = 'OUT_OF_STOCK')
              AND (l.game_name LIKE ? OR l.description LIKE ?)
            ORDER BY l.featured DESC, l.created_at DESC
        `, [`%${q}%`, `%${q}%`]);
    },

    async incrementViewCount(listingId) {
        return query('UPDATE Game_Listing SET view_count = view_count + 1 WHERE listing_id = ?', [listingId]);
    },

    async setApproval(listingId, approve) {
        return query('UPDATE Game_Listing SET admin_approved = ? WHERE listing_id = ?', [approve, listingId]);
    },

    async updateStock(listingId, newStock, status, gameKey) {
        const updateFields = gameKey 
            ? 'stock_quantity = ?, status = ?, game_key = ?'
            : 'stock_quantity = ?, status = ?';
        const updateParams = gameKey
            ? [newStock, status, gameKey, listingId]
            : [newStock, status, listingId];
        return query(`UPDATE Game_Listing SET ${updateFields} WHERE listing_id = ?`, updateParams);
    },

    async getAllForAdmin() {
        return query(`
            SELECT l.*, u.username as seller_name, c.name as category_name
            FROM Game_Listing l 
            LEFT JOIN User u ON l.seller_id = u.user_id 
            LEFT JOIN Game_Category c ON l.category_id = c.category_id
            ORDER BY l.admin_approved ASC, l.created_at DESC
        `);
    },

    async getBySellerWithCategory(sellerId) {
        return query(`
            SELECT l.*, c.name as category_name 
            FROM Game_Listing l 
            LEFT JOIN Game_Category c ON l.category_id = c.category_id 
            WHERE l.seller_id = ? ORDER BY l.created_at DESC
        `, [sellerId]);
    },

    async compareGames(listingIds) {
        const placeholders = listingIds.map(() => '?').join(',');
        return query(`
            SELECT l.*, c.name as category_name, COALESCE(u.username, 'Admin Store') as seller_name
            FROM Game_Listing l 
            LEFT JOIN Game_Category c ON l.category_id = c.category_id
            LEFT JOIN User u ON l.seller_id = u.user_id
            WHERE l.listing_id IN (${placeholders})
        `, listingIds);
    },

    async getSellerListingIds(sellerId) {
        return query('SELECT listing_id FROM Game_Listing WHERE seller_id = ?', [sellerId]);
    },

    async deleteByListingIds(listingIds) {
        if (listingIds.length > 0) {
            return query('DELETE FROM Game_Listing WHERE listing_id IN (?)', [listingIds]);
        }
    },

    async deleteBySeller(sellerId) {
        return query('DELETE FROM Game_Listing WHERE seller_id = ?', [sellerId]);
    },

    async clearCategoryId(categoryId) {
        return query('UPDATE Game_Listing SET category_id = NULL WHERE category_id = ?', [categoryId]);
    }
};

module.exports = ListingModel;
