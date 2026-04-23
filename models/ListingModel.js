const { query } = require('./db');

class ListingModel {
    static async getCategories() {
        return await query('SELECT * FROM Game_Category ORDER BY name');
    }

    static async createCategory(name, description, icon) {
        return await query(
            'INSERT INTO Game_Category (name, description, icon) VALUES (?, ?, ?)',
            [name.trim(), description || null, icon || 'fa-gamepad']
        );
    }

    static async deleteCategory(id) {
        await query('UPDATE Game_Listing SET category_id = NULL WHERE category_id = ?', [id]);
        return await query('DELETE FROM Game_Category WHERE category_id = ?', [id]);
    }

    static async createListing(sellerId, gameName, description, price, gameKey, stockQuantity, categoryId) {
        return await query(
            `INSERT INTO Game_Listing (seller_id, game_name, description, price, game_key, stock_quantity, category_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [sellerId, gameName, description, price, gameKey, stockQuantity, categoryId]
        );
    }

    static async getListings(category, minPrice, maxPrice, sort, featured) {
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
        if (featured === 'true') { sql += ' AND l.featured = true'; }
        
        switch (sort) {
            case 'price_low': sql += ' ORDER BY l.price ASC'; break;
            case 'price_high': sql += ' ORDER BY l.price DESC'; break;
            case 'rating': sql += ' ORDER BY l.rating_avg DESC'; break;
            case 'popular': sql += ' ORDER BY l.view_count DESC'; break;
            default: sql += ' ORDER BY l.featured DESC, l.created_at DESC';
        }
        
        return await query(sql, params);
    }

    static async getListingDetail(id) {
        await query('UPDATE Game_Listing SET view_count = view_count + 1 WHERE listing_id = ?', [id]);
        const listings = await query(`
            SELECT l.*, COALESCE(u.username, 'Admin Store') as seller_name, c.name as category_name
            FROM Game_Listing l 
            LEFT JOIN User u ON l.seller_id = u.user_id 
            LEFT JOIN Game_Category c ON l.category_id = c.category_id
            WHERE l.listing_id = ?
        `, [id]);
        return listings.length > 0 ? listings[0] : null;
    }

    static async getMyListings(userId) {
        return await query(`
            SELECT l.*, c.name as category_name 
            FROM Game_Listing l 
            LEFT JOIN Game_Category c ON l.category_id = c.category_id 
            WHERE l.seller_id = ? ORDER BY l.created_at DESC
        `, [userId]);
    }

    static async restockListing(listingId, sellerId, quantity, gameKey) {
        const listing = await query('SELECT * FROM Game_Listing WHERE listing_id = ? AND seller_id = ?', [listingId, sellerId]);
        if (listing.length === 0) return null;
        
        const newStock = listing[0].stock_quantity + parseInt(quantity);
        if (gameKey) {
            await query('UPDATE Game_Listing SET stock_quantity = ?, status = ?, game_key = ? WHERE listing_id = ?', [newStock, 'AVAILABLE', gameKey, listingId]);
        } else {
            await query('UPDATE Game_Listing SET stock_quantity = ?, status = ? WHERE listing_id = ?', [newStock, 'AVAILABLE', listingId]);
        }
        return listing[0];
    }

    static async createReview(listingId, userId, rating, reviewText) {
        const purchases = await query('SELECT * FROM Purchase WHERE buyer_id = ? AND listing_id = ?', [userId, listingId]);
        if (purchases.length === 0) return false;
        
        await query(
            'INSERT INTO Game_Review (listing_id, user_id, rating, review_text) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?, review_text = ?',
            [listingId, userId, rating, reviewText, rating, reviewText]
        );
        return true;
    }

    static async getReviews(listingId) {
        return await query(`
            SELECT r.*, u.username 
            FROM Game_Review r 
            JOIN User u ON r.user_id = u.user_id 
            WHERE r.listing_id = ? 
            ORDER BY r.created_at DESC
        `, [listingId]);
    }
}

module.exports = ListingModel;
