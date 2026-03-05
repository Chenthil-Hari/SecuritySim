import express from 'express';
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
            .select('username score xp level badges profilePhoto country unlockedTitles seasonalMedals')
            .sort({ score: -1, xp: -1 })
            .limit(50);

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            id: user._id,
            username: user.username,
            score: user.score,
            xp: user.xp,
            level: user.level,
            badgeCount: user.badges.length,
            profilePhoto: user.profilePhoto,
            country: user.country || 'Global',
            unlockedTitles: user.unlockedTitles || [],
            seasonalMedals: user.seasonalMedals || []
        }));

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
    }
});

export default router;
