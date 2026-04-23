const EventModel = require('../models/eventModel');
const UserModel = require('../models/userModel');
const { sendNotification } = require('../utils/notification');

const eventController = {
    async getAll(req, res) {
        try {
            const events = await EventModel.getAll();
            res.json({ success: true, events });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching events' });
        }
    },

    async getById(req, res) {
        try {
            const events = await EventModel.findById(req.params.id);
            if (events.length === 0) {
                return res.status(404).json({ success: false, message: 'Event not found' });
            }
            
            const registrations = await EventModel.getRegistrations(req.params.id);
            
            let userRegistered = false;
            if (req.session.user && req.session.user.type === 'user') {
                const userReg = registrations.filter(r => r.user_id === req.session.user.id);
                userRegistered = userReg.length > 0;
            }
            
            res.json({ success: true, event: events[0], registrations, userRegistered });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching event' });
        }
    },

    async register(req, res) {
        try {
            const events = await EventModel.findById(req.params.id);
            if (events.length === 0) {
                return res.status(404).json({ success: false, message: 'Event not found' });
            }
            
            const event = events[0];
            if (event.status !== 'UPCOMING' && event.status !== 'ONGOING') {
                return res.status(400).json({ success: false, message: 'Registration closed' });
            }
            
            if (event.max_participants) {
                const count = await EventModel.getRegistrationCount(req.params.id);
                if (count[0].count >= event.max_participants) {
                    return res.status(400).json({ success: false, message: 'Event is full' });
                }
            }
            
            await EventModel.register(req.params.id, req.session.user.id);
            res.json({ success: true, message: 'Registered successfully' });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Already registered' });
            }
            res.status(500).json({ success: false, message: 'Error registering' });
        }
    },

    // Admin: Create Event
    async create(req, res) {
        const { title, description, eventType, startDate, endDate, eventDate, maxParticipants, prizes, bannerImage } = req.body;
        
        const start = startDate || eventDate;
        const end = endDate || eventDate;
        const type = eventType || 'SALE';
        
        try {
            const result = await EventModel.create(title, description, type, start, end, maxParticipants, prizes, bannerImage, req.session.user.id);
            
            const users = await UserModel.getAllUserIds();
            for (const user of users) {
                await sendNotification(user.user_id, 'EVENT',
                    'New Event!',
                    `${title} - ${description ? description.substring(0, 50) : ''}...`,
                    '/events'
                );
            }
            
            res.json({ success: true, message: 'Event created', eventId: result.insertId });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error creating event' });
        }
    },

    // Admin: Update Event Status
    async updateStatus(req, res) {
        const { status } = req.body;
        
        try {
            await EventModel.updateStatus(req.params.id, status);
            
            const registrations = await EventModel.getRegisteredUserIds(req.params.id);
            const events = await EventModel.getTitle(req.params.id);
            
            for (const reg of registrations) {
                await sendNotification(reg.user_id, 'EVENT',
                    'Event Update',
                    `"${events[0].title}" is now ${status.toLowerCase()}`,
                    '/events'
                );
            }
            
            res.json({ success: true, message: 'Status updated' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error updating status' });
        }
    },

    // Admin: Delete Event
    async deleteEvent(req, res) {
        try {
            await EventModel.deleteRegistrations(req.params.id);
            await EventModel.deleteEvent(req.params.id);
            res.json({ success: true, message: 'Event deleted' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error deleting event' });
        }
    },

    // Admin: Save Results
    async saveResults(req, res) {
        const { results } = req.body;
        
        try {
            for (const result of results) {
                await EventModel.updatePlacement(req.params.id, result.userId, result.placement);
            }
            
            await EventModel.setCompleted(req.params.id);
            res.json({ success: true, message: 'Results saved' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error saving results' });
        }
    }
};

module.exports = eventController;
