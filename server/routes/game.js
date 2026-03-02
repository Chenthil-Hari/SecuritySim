import { Router } from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// GET /api/game/state — Load game state
router.get('/state', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json({
            gameState: user.gameState,
            settings: user.settings
        });
    } catch (err) {
        console.error('Load game state error:', err);
        res.status(500).json({ error: 'Failed to load game state.' });
    }
});

// PUT /api/game/state — Save game state
router.put('/state', authMiddleware, async (req, res) => {
    try {
        const { gameState, settings } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (gameState) {
            user.gameState = { ...user.gameState.toObject?.() || user.gameState, ...gameState };
        }
        if (settings) {
            user.settings = { ...user.settings.toObject?.() || user.settings, ...settings };
        }
        await user.save();

        res.json({
            gameState: user.gameState,
            settings: user.settings
        });
    } catch (err) {
        console.error('Save game state error:', err);
        res.status(500).json({ error: 'Failed to save game state.' });
    }
});

export default router;
