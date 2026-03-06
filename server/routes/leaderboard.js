import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = express.Router();

// GET /api/leaderboard — top 50 users sorted by score (optional ?country= filter)
router.get('/', async (req, res) => {
    try {
        const { country } = req.query;
        const query = {};

        // If a country is provided, filter the results for that specific country
        if (country) {
            query.country = country;
        }

        const users = await User.find(query)
            .select('username score xp level badges profilePhoto country unlockedTitles seasonalMedals customization')
            .sort({ score: -1, xp: -1 })
            .limit(50);

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            id: user._id,
            username: user.username || 'Anonymous',
            score: user.score || 0,
            xp: user.xp || 0,
            level: user.level || 1,
            badgeCount: (user.badges || []).length,
            profilePhoto: user.profilePhoto,
            country: user.country || 'Global',
            unlockedTitles: user.unlockedTitles || [],
            seasonalMedals: user.seasonalMedals || [],
            customization: user.customization || { auraEnabled: true }
        }));

        res.json(leaderboard);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ 
            message: 'Error fetching leaderboard', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            diagnostics: {
                modelState: mongoose.connection.readyState,
                hasQuery: !!req.query
            }
        });
    }
});

export default router;
