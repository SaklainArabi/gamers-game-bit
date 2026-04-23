const { query } = require('../config/db');

const WishlistModel = {
    async findExisting(userId, listingId, gameName) {
        return query(
            'SELECT wishlist_id FROM Wishlist WHERE user_id = ? AND (listing_id = ? OR (listing_id IS NULL AND game_name = ?))',
            [userId, listingId || null, gameName]
        );
    },

    async add(userId, gameName, listingId) {
        return query(
            'INSERT INTO Wishlist (user_id, game_name, listing_id) VALUES (?, ?, ?)',
            [userId, gameName, listingId || null]
        );
    },

    async getByUser(userId) {
        return query(`
            SELECT w.*, l.price, l.status, l.admin_approved
            FROM Wishlist w 
            LEFT JOIN Game_Listing l ON w.listing_id = l.listing_id
            WHERE w.user_id = ? 
            ORDER BY w.created_at DESC
        `, [userId]);
    },

    async remove(wishlistId, userId) {
        return query('DELETE FROM Wishlist WHERE wishlist_id = ? AND user_id = ?', [wishlistId, userId]);
    },

    async getUnfulfilledForAdmin() {
        return query(`
            SELECT w.*, u.username, u.email 
            FROM Wishlist w 
            JOIN User u ON w.user_id = u.user_id 
            WHERE w.listing_id IS NULL
            ORDER BY w.created_at DESC
        `);
    },

    async findByGameName(gameName) {
        return query(
            'SELECT w.*, u.username FROM Wishlist w JOIN User u ON w.user_id = u.user_id WHERE LOWER(w.game_name) LIKE LOWER(?) AND w.notified = false',
            [`%${gameName}%`]
        );
    },

    async findByListingId(listingId) {
        return query(
            'SELECT w.*, u.username FROM Wishlist w JOIN User u ON w.user_id = u.user_id WHERE w.listing_id = ? AND w.notified = false',
            [listingId]
        );
    },

    async linkListing(wishlistId, listingId) {
        return query('UPDATE Wishlist SET listing_id = ?, notified = true WHERE wishlist_id = ?', [listingId, wishlistId]);
    },

    async markNotified(wishlistId) {
        return query('UPDATE Wishlist SET notified = true WHERE wishlist_id = ?', [wishlistId]);
    },

    async deleteByListingIds(listingIds) {
        if (listingIds.length > 0) {
            return query('DELETE FROM Wishlist WHERE listing_id IN (?)', [listingIds]);
        }
    },

    async deleteByUser(userId) {
        return query('DELETE FROM Wishlist WHERE user_id = ?', [userId]);
    }
};

module.exports = WishlistModel;
