const { query } = require('../config/db');

const AdvertisementModel = {
    async getActive(position) {
        let sql = `
            SELECT a.*, l.game_name 
            FROM Advertisement a 
            LEFT JOIN Game_Listing l ON a.listing_id = l.listing_id
            WHERE a.is_active = true 
            AND (a.start_date IS NULL OR a.start_date <= NOW()) 
            AND (a.end_date IS NULL OR a.end_date >= NOW())
        `;
        const params = [];
        
        if (position) {
            sql += ' AND a.position = ?';
            params.push(position);
        }
        
        sql += ' ORDER BY RAND()';
        return query(sql, params);
    },

    async incrementClicks(adId) {
        return query('UPDATE Advertisement SET click_count = click_count + 1 WHERE ad_id = ?', [adId]);
    },

    async create(title, imageUrl, linkUrl, listingId, position, startDate, endDate) {
        return query(
            `INSERT INTO Advertisement (title, image_url, link_url, listing_id, position, start_date, end_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, imageUrl, linkUrl || '/', listingId || null, position || 'TOP', startDate || null, endDate || null]
        );
    },

    async getAll() {
        return query('SELECT * FROM Advertisement ORDER BY created_at DESC');
    },

    async toggle(adId) {
        return query('UPDATE Advertisement SET is_active = NOT is_active WHERE ad_id = ?', [adId]);
    },

    async deleteAd(adId) {
        return query('DELETE FROM Advertisement WHERE ad_id = ?', [adId]);
    },

    async deleteByListingIds(listingIds) {
        if (listingIds.length > 0) {
            return query('DELETE FROM Advertisement WHERE listing_id IN (?)', [listingIds]);
        }
    }
};

module.exports = AdvertisementModel;
