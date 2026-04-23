const MiscModel = require('../models/MiscModel');

class MiscPresenter {
    // Events
    static async getEvents(req, res) {
        try {
            const events = await MiscModel.getEvents();
            res.json({ success: true, events });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching events' });
        }
    }

    static async getEvent(req, res) {
        try {
            const event = await MiscModel.getEvent(req.params.id);
            if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
            const registrations = await MiscModel.getEventRegistrations(req.params.id);
            let userRegistered = false;
            if (req.session.user && req.session.user.type === 'user') {
                userRegistered = registrations.some(r => r.user_id === req.session.user.id);
            }
            res.json({ success: true, event, registrations, userRegistered });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching event' });
        }
    }

    static async registerForEvent(req, res) {
        if (!req.session.user || req.session.user.type !== 'user') return res.status(401).json({ success: false, message: 'User login required' });
        try {
            const event = await MiscModel.getEvent(req.params.id);
            if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
            if (event.status !== 'UPCOMING' && event.status !== 'ONGOING') return res.status(400).json({ success: false, message: 'Registration closed' });
            
            if (event.max_participants) {
                const count = await MiscModel.getParticipantCount(req.params.id);
                if (count >= event.max_participants) return res.status(400).json({ success: false, message: 'Event is full' });
            }
            
            await MiscModel.registerForEvent(req.params.id, req.session.user.id);
            res.json({ success: true, message: 'Registered successfully' });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Already registered' });
            res.status(500).json({ success: false, message: 'Error registering' });
        }
    }

    static async createEvent(req, res) {
        if (!req.session.user || req.session.user.type !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
        const { title, description, eventType, startDate, endDate, eventDate, maxParticipants, prizes, bannerImage } = req.body;
        const start = startDate || eventDate;
        const end = endDate || eventDate;
        const type = eventType || 'SALE';
        
        try {
            const result = await MiscModel.createEvent(title, description, type, start, end, maxParticipants || null, prizes || null, bannerImage || null, req.session.user.id);
            res.json({ success: true, message: 'Event created', eventId: result.insertId });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error creating event' });
        }
    }

    static async updateEventStatus(req, res) {
        if (!req.session.user || req.session.user.type !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
        const { status } = req.body;
        try {
            await MiscModel.updateEventStatus(req.params.id, status);
            res.json({ success: true, message: 'Status updated' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error updating status' });
        }
    }

    static async deleteEvent(req, res) {
        if (!req.session.user || req.session.user.type !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
        try {
            await MiscModel.deleteEvent(req.params.id);
            res.json({ success: true, message: 'Event deleted' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error deleting event' });
        }
    }

    static async saveEventResults(req, res) {
        if (!req.session.user || req.session.user.type !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
        const { results } = req.body;
        try {
            await MiscModel.saveEventResults(req.params.id, results);
            res.json({ success: true, message: 'Results saved' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error saving results' });
        }
    }

    // Session
    static logout(req, res) {
        req.session.destroy();
        res.json({ success: true, message: 'Logged out' });
    }

    static checkSession(req, res) {
        if (req.session.user) {
            res.json({ success: true, user: req.session.user });
        } else {
            res.json({ success: false });
        }
    }
}

module.exports = MiscPresenter;
