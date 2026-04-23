const { query } = require('../config/db');

// io instance will be set after server starts
let io = null;

function setIO(ioInstance) {
    io = ioInstance;
}

async function sendNotification(userId, type, title, message, link = null) {
    try {
        await query(
            'INSERT INTO Notification (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)',
            [userId, type, title, message, link]
        );
        if (io) {
            io.to(`user_${userId}`).emit('notification', { type, title, message, link, timestamp: new Date() });
        }
    } catch (err) {
        console.error('Notification error:', err);
    }
}

function notifyAdmins(type, title, message) {
    if (io) {
        io.to('admin_room').emit('admin_notification', { type, title, message, timestamp: new Date() });
    }
}

module.exports = { setIO, sendNotification, notifyAdmins };
