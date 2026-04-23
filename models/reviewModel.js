const { query } = require('../config/db');

const ReviewModel = {
    async createOrUpdate(listingId, userId, rating, reviewText) {
        return query(
            'INSERT INTO Game_Review (listing_id, user_id, rating, review_text) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?, review_text = ?',
            [listingId, userId, rating, reviewText, rating, reviewText]
        );
    },

    async getByListing(listingId) {
        return query(`
            SELECT r.*, u.username 
            FROM Game_Review r 
            JOIN User u ON r.user_id = u.user_id 
            WHERE r.listing_id = ? 
            ORDER BY r.created_at DESC
        `, [listingId]);
    },

    async deleteByListingIds(listingIds) {
        if (listingIds.length > 0) {
            return query('DELETE FROM Game_Review WHERE listing_id IN (?)', [listingIds]);
        }
    },

    async deleteByUser(userId) {
        return query('DELETE FROM Game_Review WHERE user_id = ?', [userId]);
    }
};

module.exports = ReviewModel;
