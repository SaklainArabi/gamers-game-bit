const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Try to load dotenv, but don't fail if not present
try {
    require('dotenv').config();
} catch (e) {
    console.log('dotenv not loaded, using defaults');
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:5173"],
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Stripe setup (optional - works without it for balance payments)
let stripe = null;
try {
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key') {
        stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        console.log('Stripe initialized');
    }
} catch (e) {
    console.log('Stripe not configured - balance payments only');
}

// ============= MIDDLEWARE =============
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public/react-build')));
app.use(express.static('public'));

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'game-marketplace-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
});
app.use(sessionMiddleware);

// Share session with Socket.IO
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

// ============= INITIALIZE SOCKET.IO =============
const { setIO } = require('./utils/notification');
const { initSocket } = require('./socket/socketHandler');
setIO(io);
initSocket(io);

// ============= INITIALIZE DATABASE =============
require('./config/db');

// ============= MOUNT ROUTES =============
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const listingRoutes = require('./routes/listingRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const communityRoutes = require('./routes/communityRoutes');
const eventRoutes = require('./routes/eventRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const advertisementRoutes = require('./routes/advertisementRoutes');
const helpRoutes = require('./routes/helpRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', listingRoutes);
app.use('/api', purchaseRoutes);
app.use('/api', reviewRoutes);
app.use('/api', wishlistRoutes);
app.use('/api', communityRoutes);
app.use('/api', eventRoutes);
app.use('/api', subscriptionRoutes);
app.use('/api', advertisementRoutes);
app.use('/api', helpRoutes);
app.use('/api', sessionRoutes);

// ============= CATCH-ALL ROUTE =============
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'react-build', 'index.html'));
});

// ============= START SERVER =============
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Socket.IO enabled for real-time features');
});
