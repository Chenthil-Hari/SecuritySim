import { Router } from 'express';
import Leaderboard from '../models/Leaderboard.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// GET /api/leaderboard — Get all entries sorted by score desc
router.get('/', async (req, res) => {
    try {
        const entries = await Leaderboard.find()
            .sort({ score: -1 })
            .limit(100)
            .lean();

        // Add rank
        const ranked = entries.map((entry, i) => ({
            ...entry,
            id: entry.userId.toString(),
            rank: i + 1
        }));

        res.json({ players: ranked });
    } catch (err) {
        console.error('Get leaderboard error:', err);
        res.status(500).json({ error: 'Failed to load leaderboard.' });
    }
});

// PUT /api/leaderboard — Upsert current user's leaderboard entry
router.put('/', authMiddleware, async (req, res) => {
    try {
        const { displayName, photoURL, score, level, xp, scenariosCompleted, badgesCount } = req.body;

        await Leaderboard.findOneAndUpdate(
            { userId: req.user.id },
            {
                userId: req.user.id,
                displayName: displayName || 'Anonymous',
                photoURL: photoURL || null,
                score: score ?? 50,
                level: level ?? 1,
                xp: xp ?? 0,
                scenariosCompleted: scenariosCompleted ?? 0,
                badgesCount: badgesCount ?? 0,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Upsert leaderboard error:', err);
        res.status(500).json({ error: 'Failed to update leaderboard.' });
    }
});

export default router;
