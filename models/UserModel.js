const { query } = require('./db');

class UserModel {
    static async createUser(username, email, password) {
        const result = await query(
            'INSERT INTO User (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );
        return result.insertId;
    }

    static async addBalance(userId, amount) {
        return await query('UPDATE User SET balance = balance + ? WHERE user_id = ?', [amount, userId]);
    }

    static async findByCredentials(username, password) {
        const results = await query('SELECT * FROM User WHERE username = ? AND password = ?', [username, password]);
        return results.length > 0 ? results[0] : null;
    }

    static async getProfile(userId) {
        const results = await query(
            `SELECT u.user_id, u.username, u.email, u.balance, u.is_restricted, 
                    u.profile_picture, u.bio, u.created_at
             FROM User u 
             WHERE u.user_id = ?`,
            [userId]
        );
        return results.length > 0 ? results[0] : null;
    }

    static async updateProfile(userId, bio, profilePicture) {
        return await query(
            'UPDATE User SET bio = ?, profile_picture = ? WHERE user_id = ?',
            [bio, profilePicture, userId]
        );
    }
}

module.exports = UserModel;
