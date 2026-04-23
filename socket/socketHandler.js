const HelpModel = require('../models/helpModel');

const connectedUsers = new Map();
const connectedAdmins = new Map();

function initSocket(io) {
    io.on('connection', (socket) => {
        const session = socket.request.session;
        
        if (session && session.user) {
            if (session.user.type === 'user') {
                connectedUsers.set(session.user.id, socket.id);
            } else if (session.user.type === 'admin') {
                connectedAdmins.set(session.user.id, socket.id);
            }
        }

        socket.on('join', (data) => {
            if (data.userId) {
                socket.join(`user_${data.userId}`);
            }
            if (data.adminId) {
                socket.join(`admin_${data.adminId}`);
                socket.join('admin_room');
            }
        });

        socket.on('chat_message', async (data) => {
            const { userId, message, senderType } = data;
            
            try {
                let adminId = null;
                if (senderType === 'ADMIN' && session && session.user) {
                    adminId = session.user.id;
                }
                
                await HelpModel.saveChatMessage(userId, adminId, message, senderType);
                
                io.to(`user_${userId}`).emit('new_message', { userId, message, senderType, timestamp: new Date() });
                io.to('admin_room').emit('new_message', { userId, message, senderType, timestamp: new Date() });
            } catch (err) {
                console.error('Chat message error:', err);
            }
        });

        socket.on('disconnect', () => {
            if (session && session.user) {
                if (session.user.type === 'user') {
                    connectedUsers.delete(session.user.id);
                } else {
                    connectedAdmins.delete(session.user.id);
                }
            }
        });
    });
}

module.exports = { initSocket, connectedUsers, connectedAdmins };
