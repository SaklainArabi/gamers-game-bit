const { query } = require('../config/db');

const PurchaseModel = {
    async findByBuyerAndListing(buyerId, listingId) {
        return query('SELECT * FROM Purchase WHERE buyer_id = ? AND listing_id = ?', [buyerId, listingId]);
    },

    async create(buyerId, listingId, purchasePrice, originalPrice, discountApplied) {
        return query(
            'INSERT INTO Purchase (buyer_id, listing_id, purchase_price, original_price, discount_applied) VALUES (?, ?, ?, ?, ?)',
            [buyerId, listingId, purchasePrice, originalPrice, discountApplied]
        );
    },

    async getByBuyer(buyerId) {
        return query(`
            SELECT p.*, l.game_name, l.description, l.game_key, l.trailer_url, c.name as category_name
            FROM Purchase p 
            JOIN Game_Listing l ON p.listing_id = l.listing_id 
            LEFT JOIN Game_Category c ON l.category_id = c.category_id
            WHERE p.buyer_id = ? 
            ORDER BY p.purchase_date DESC
        `, [buyerId]);
    },

    async getStats() {
        return query('SELECT COUNT(*) as count, SUM(purchase_price) as revenue FROM Purchase');
    },

    async deleteByListingIds(listingIds) {
        if (listingIds.length > 0) {
            return query('DELETE FROM Purchase WHERE listing_id IN (?)', [listingIds]);
        }
    },

    async deleteByBuyer(buyerId) {
        return query('DELETE FROM Purchase WHERE buyer_id = ?', [buyerId]);
    }
};

module.exports = PurchaseModel;
