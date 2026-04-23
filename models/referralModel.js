const { query } = require('../config/db');

const ReferralModel = {
    async create(referrerId, referredId, bonusAmount) {
        return query(
            'INSERT INTO Referral (referrer_id, referred_id, bonus_amount, status, completed_at) VALUES (?, ?, ?, "COMPLETED", NOW())',
            [referrerId, referredId, bonusAmount]
        );
    },

    async getPendingByUser(userId) {
        return query("SELECT * FROM Referral WHERE referred_id = ? AND status = 'PENDING'", [userId]);
    },

    async complete(referralId) {
        return query("UPDATE Referral SET status = 'COMPLETED', completed_at = NOW() WHERE referral_id = ?", [referralId]);
    },

    async deleteByUser(userId) {
        return query('DELETE FROM Referral WHERE referrer_id = ? OR referred_id = ?', [userId, userId]);
    }
};

module.exports = ReferralModel;
