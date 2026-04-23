const SubscriptionModel = require('../models/subscriptionModel');
const UserModel = require('../models/userModel');
const { sendNotification } = require('../utils/notification');

const subscriptionController = {
    getPlans(req, res) {
        res.json({
            success: true,
            plans: [
                { type: 'MONTHLY', price: 9.99, discount: 20, features: ['20% off all purchases', 'Priority support', 'Early access to events'] },
                { type: 'YEARLY', price: 99.99, discount: 20, features: ['20% off all purchases', 'Priority support', 'Early access to events', '2 months free'] }
            ]
        });
    },

    async create(req, res) {
        const { planType } = req.body;
        
        try {
            const existing = await SubscriptionModel.getActive(req.session.user.id);
            
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'Already subscribed' });
            }
            
            const price = planType === 'YEARLY' ? 99.99 : 9.99;
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + (planType === 'YEARLY' ? 12 : 1));
            
            const users = await UserModel.getBalance(req.session.user.id);
            if (users[0].balance < price) {
                return res.status(400).json({ success: false, message: 'Insufficient balance. Please add balance first.' });
            }
            
            await UserModel.deductBalance(req.session.user.id, price);
            await SubscriptionModel.create(req.session.user.id, planType, endDate);
            
            await sendNotification(req.session.user.id, 'SYSTEM',
                'Subscription Active!',
                `Your ${planType.toLowerCase()} subscription is now active. Enjoy 20% off all purchases!`,
                '/user-dashboard'
            );
            
            res.json({ success: true, message: 'Subscription created successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error creating subscription' });
        }
    },

    async cancel(req, res) {
        try {
            await SubscriptionModel.cancel(req.session.user.id);
            res.json({ success: true, message: 'Subscription cancelled' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error cancelling subscription' });
        }
    }
};

module.exports = subscriptionController;
