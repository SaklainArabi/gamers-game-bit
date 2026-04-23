const { query } = require('../config/db');

const UserModel = {
    async findByCredentials(username, password) {
        return query('SELECT * FROM User WHERE username = ? AND password = ?', [username, password]);
    },

    async findById(userId) {
        return query(
            `SELECT u.user_id, u.username, u.email, u.balance, u.is_restricted, 
                    u.referral_code, u.language_preference, u.profile_picture, u.bio, u.total_sales, u.created_at,
                    s.plan_type, s.status as subscription_status, s.discount_percentage, s.end_date as subscription_end
             FROM User u 
             LEFT JOIN Subscription s ON u.user_id = s.user_id AND s.status = 'ACTIVE'
             WHERE u.user_id = ?`,
            [userId]
        );
    },

    async findByReferralCode(referralCode) {
        return query('SELECT user_id FROM User WHERE referral_code = ?', [referralCode]);
    },

    async create(username, email, password, referredBy, initialBalance) {
        return query(
            'INSERT INTO User (username, email, password, referred_by, balance) VALUES (?, ?, ?, ?, ?)',
            [username, email, password, referredBy, initialBalance]
        );
    },

    async updateProfile(userId, bio, profilePicture, languagePreference) {
        return query(
            'UPDATE User SET bio = ?, profile_picture = ?, language_preference = ? WHERE user_id = ?',
            [bio, profilePicture, languagePreference, userId]
        );
    },

    async addBalance(userId, amount) {
        return query('UPDATE User SET balance = balance + ? WHERE user_id = ?', [amount, userId]);
    },

    async deductBalance(userId, amount) {
        return query('UPDATE User SET balance = balance - ? WHERE user_id = ?', [amount, userId]);
    },

    async getBalance(userId) {
        return query('SELECT balance FROM User WHERE user_id = ?', [userId]);
    },

    async setRestricted(userId, restrict) {
        return query('UPDATE User SET is_restricted = ? WHERE user_id = ?', [restrict, userId]);
    },

    async getAllUsers() {
        return query(
            `SELECT u.user_id, u.username, u.email, u.balance, u.is_restricted, u.total_sales, u.created_at,
                    s.plan_type, s.status as subscription_status
             FROM User u 
             LEFT JOIN Subscription s ON u.user_id = s.user_id AND s.status = 'ACTIVE'`
        );
    },

    async getAllUserIds() {
        return query('SELECT user_id FROM User');
    },

    async clearReferredBy(userId) {
        return query('UPDATE User SET referred_by = NULL WHERE referred_by = ?', [userId]);
    },

    async deleteUser(userId) {
        return query('DELETE FROM User WHERE user_id = ?', [userId]);
    }
};

module.exports = UserModel;
