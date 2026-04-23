const { query } = require('../config/db');

const EventModel = {
    async getAll() {
        return query(`
            SELECT e.*, 
                   (SELECT COUNT(*) FROM Event_Registration WHERE event_id = e.event_id) as participant_count
            FROM Event e 
            ORDER BY 
                CASE e.status 
                    WHEN 'ONGOING' THEN 1 
                    WHEN 'UPCOMING' THEN 2 
                    WHEN 'COMPLETED' THEN 3 
                    ELSE 4 
                END,
                e.start_date ASC
        `);
    },

    async findById(eventId) {
        return query('SELECT * FROM Event WHERE event_id = ?', [eventId]);
    },

    async getRegistrations(eventId) {
        return query(`
            SELECT er.*, u.username 
            FROM Event_Registration er 
            JOIN User u ON er.user_id = u.user_id 
            WHERE er.event_id = ? 
            ORDER BY er.placement ASC, er.registered_at ASC
        `, [eventId]);
    },

    async getRegistrationCount(eventId) {
        return query('SELECT COUNT(*) as count FROM Event_Registration WHERE event_id = ?', [eventId]);
    },

    async register(eventId, userId) {
        return query('INSERT INTO Event_Registration (event_id, user_id) VALUES (?, ?)', [eventId, userId]);
    },

    async create(title, description, eventType, startDate, endDate, maxParticipants, prizes, bannerImage, createdBy) {
        return query(
            `INSERT INTO Event (title, description, event_type, start_date, end_date, max_participants, prizes, banner_image, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, eventType, startDate, endDate, maxParticipants || null, prizes || null, bannerImage || null, createdBy]
        );
    },

    async updateStatus(eventId, status) {
        return query('UPDATE Event SET status = ? WHERE event_id = ?', [status, eventId]);
    },

    async getRegisteredUserIds(eventId) {
        return query('SELECT user_id FROM Event_Registration WHERE event_id = ?', [eventId]);
    },

    async getTitle(eventId) {
        return query('SELECT title FROM Event WHERE event_id = ?', [eventId]);
    },

    async updatePlacement(eventId, userId, placement) {
        return query('UPDATE Event_Registration SET placement = ? WHERE event_id = ? AND user_id = ?', [placement, eventId, userId]);
    },

    async setCompleted(eventId) {
        return query("UPDATE Event SET status = 'COMPLETED' WHERE event_id = ?", [eventId]);
    },

    async deleteRegistrations(eventId) {
        return query('DELETE FROM Event_Registration WHERE event_id = ?', [eventId]);
    },

    async deleteEvent(eventId) {
        return query('DELETE FROM Event WHERE event_id = ?', [eventId]);
    },

    async deleteRegistrationsByUser(userId) {
        return query('DELETE FROM Event_Registration WHERE user_id = ?', [userId]);
    }
};

module.exports = EventModel;
