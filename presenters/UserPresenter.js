const UserModel = require('../models/UserModel');

class UserPresenter {
    static async register(req, res) {
        const { username, email, password } = req.body;
        
        try {
            await UserModel.createUser(username, email, password);
            res.json({ success: true, message: 'Registration successful' });
        } catch (err) {
            res.status(400).json({ success: false, message: 'Username or email already exists' });
        }
    }

    static async login(req, res) {
        const { username, password } = req.body;
        
        try {
            const user = await UserModel.findByCredentials(username, password);
            
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
            
            if (user.is_restricted) {
                return res.status(403).json({ success: false, message: 'Your account has been restricted' });
            }
            
            req.session.user = {
                id: user.user_id,
                username: user.username,
                type: 'user'
            };
            res.json({ success: true, message: 'Login successful', user: req.session.user });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    static async getProfile(req, res) {
        if (!req.session.user || req.session.user.type !== 'user') {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        try {
            const profile = await UserModel.getProfile(req.session.user.id);
            if (!profile) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            res.json({ success: true, user: profile });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    static async updateProfile(req, res) {
        if (!req.session.user || req.session.user.type !== 'user') {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        const { bio, profile_picture } = req.body;
        
        try {
            await UserModel.updateProfile(req.session.user.id, bio, profile_picture);
            res.json({ success: true, message: 'Profile updated' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error updating profile' });
        }
    }
}

module.exports = UserPresenter;
