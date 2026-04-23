const { query } = require('./db');

class MiscModel {
    // Events
    static async getEvents() {
        return await query(`
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
    }

    static async getEvent(eventId) {
        const events = await query('SELECT * FROM Event WHERE event_id = ?', [eventId]);
        return events.length > 0 ? events[0] : null;
    }

    static async getEventRegistrations(eventId) {
        return await query(`
            SELECT er.*, u.username 
            FROM Event_Registration er 
            JOIN User u ON er.user_id = u.user_id 
            WHERE er.event_id = ? 
            ORDER BY er.placement ASC, er.registered_at ASC
        `, [eventId]);
    }

    static async registerForEvent(eventId, userId) {
        return await query('INSERT INTO Event_Registration (event_id, user_id) VALUES (?, ?)', [eventId, userId]);
    }

    static async getParticipantCount(eventId) {
        const count = await query('SELECT COUNT(*) as count FROM Event_Registration WHERE event_id = ?', [eventId]);
        return count[0].count;
    }

    static async createEvent(title, description, type, start, end, maxParticipants, prizes, bannerImage, createdBy) {
        return await query(
            `INSERT INTO Event (title, description, event_type, start_date, end_date, max_participants, prizes, banner_image, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, type, start, end, maxParticipants, prizes, bannerImage, createdBy]
        );
    }

    static async getAllUserIds() {
        return await query('SELECT user_id FROM User');
    }

    static async updateEventStatus(eventId, status) {
        return await query('UPDATE Event SET status = ? WHERE event_id = ?', [status, eventId]);
    }

    static async getEventParticipants(eventId) {
        return await query('SELECT user_id FROM Event_Registration WHERE event_id = ?', [eventId]);
    }

    static async deleteEvent(eventId) {
        await query('DELETE FROM Event_Registration WHERE event_id = ?', [eventId]);
        return await query('DELETE FROM Event WHERE event_id = ?', [eventId]);
    }

    static async saveEventResults(eventId, results) {
        for (const result of results) {
            await query('UPDATE Event_Registration SET placement = ? WHERE event_id = ? AND user_id = ?', [result.placement, eventId, result.userId]);
        }
        return await query("UPDATE Event SET status = 'COMPLETED' WHERE event_id = ?", [eventId]);
    }
}

module.exports = MiscModel;
