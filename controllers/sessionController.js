const sessionController = {
    logout(req, res) {
        req.session.destroy();
        res.json({ success: true, message: 'Logged out' });
    },

    checkSession(req, res) {
        if (req.session.user) {
            res.json({ success: true, user: req.session.user });
        } else {
            res.json({ success: false });
        }
    },

    getLanguages(req, res) {
        res.json({
            success: true,
            languages: [
                { code: 'en', name: 'English', flag: '🇺🇸' },
                { code: 'es', name: 'Español', flag: '🇪🇸' },
                { code: 'fr', name: 'Français', flag: '🇫🇷' },
                { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                { code: 'ja', name: '日本語', flag: '🇯🇵' },
                { code: 'ko', name: '한국어', flag: '🇰🇷' },
                { code: 'zh', name: '中文', flag: '🇨🇳' },
                { code: 'pt', name: 'Português', flag: '🇧🇷' },
                { code: 'ru', name: 'Русский', flag: '🇷🇺' },
                { code: 'ar', name: 'العربية', flag: '🇸🇦' }
            ]
        });
    }
};

module.exports = sessionController;
