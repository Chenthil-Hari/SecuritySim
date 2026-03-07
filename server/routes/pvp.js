import express from 'express';
import Match from '../models/Match.js';
import { authenticateToken } from '../middleware/auth.js';
import { interactiveScenarios } from '../../src/data/interactiveScenarios.js';
import User from '../models/User.js';

const router = express.Router();

// Invite a friend to a duel
router.post('/invite/:friendId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { friendId } = req.params;

        // Pick a random scenario
        const randomScenario = interactiveScenarios[Math.floor(Math.random() * interactiveScenarios.length)];
        
        const match = new Match({
            players: [userId, friendId],
            scenarioId: randomScenario.id,
            status: 'searching' // Acts as 'pending' for invitations
        });
        await match.save();

        res.status(201).json({ message: 'Invitation sent', matchId: match._id, scenarioId: randomScenario.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get online friends
router.get('/online-friends', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userSockets = req.app.get('userSockets');
        const user = await User.findById(userId).populate('friends', '_id');
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        // A user is considered online if they have a heartbeat in the last 2 minutes
        const onlineThreshold = new Date(Date.now() - 2 * 60 * 1000);
        
        const onlineFriendIds = user.friends
            .filter(f => {
                // Check socket map first (fastest)
                const fid = f._id ? f._id.toString() : f.toString();
                if (userSockets.has(fid.trim())) return true;
                
                // Fallback to database lastSeen (best for Vercel)
                return f.lastSeen && f.lastSeen > onlineThreshold;
            })
            .map(f => f._id ? f._id.toString() : f.toString());

        res.json(onlineFriendIds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Respond to an invitation
router.post('/respond/:matchId', authenticateToken, async (req, res) => {
    try {
        const { matchId } = req.params;
        const { accept } = req.body;

        if (!accept) {
            await Match.findByIdAndDelete(matchId);
            return res.json({ message: 'Invitation declined' });
        }

        const match = await Match.findById(matchId);
        if (!match) return res.status(404).json({ message: 'Match not found' });

        match.status = 'playing';
        await match.save();

        res.json({ message: 'Invitation accepted', match });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get match status
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const match = await Match.findById(req.params.id).populate('players', 'username profilePhoto');
        if (!match) return res.status(404).json({ message: 'Match not found' });
        res.json(match);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
