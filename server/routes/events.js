import express from 'express';
import Event from '../models/Event.js';

const router = express.Router();

// GET /api/events/active — Get currently active global events
router.get('/active', async (req, res) => {
    try {
        const events = await Event.find({
            isActive: true,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
