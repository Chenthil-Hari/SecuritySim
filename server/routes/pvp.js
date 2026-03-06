import express from 'express';
import Match from '../models/Match.js';
import { authenticateToken } from '../middleware/auth.js';
import { interactiveScenarios } from '../../src/data/interactiveScenarios.js';

const router = express.Router();

// Enter matchmaking queue
router.post('/queue', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const io = req.app.get('io');

        // Check if user is already in an active or searching match
        const activeMatch = await Match.findOne({
            players: userId,
            status: { $in: ['searching', 'playing'] }
        });

        if (activeMatch) {
            return res.status(400).json({ message: 'Already in a match or queue' });
        }

        // Try to find a searching match
        let match = await Match.findOne({ status: 'searching' });

        if (match) {
            // Join the match
            match.players.push(userId);
            match.status = 'playing';
            await match.save();

            // Notify both players
            io.to(match._id.toString()).emit('match_found', { matchId: match._id, scenarioId: match.scenarioId });
            
            return res.json({ message: 'Match found!', match });
        } else {
            // Create a new searching match
            // Pick a random scenario
            const randomScenario = interactiveScenarios[Math.floor(Math.random() * interactiveScenarios.length)];
            
            match = new Match({
                players: [userId],
                scenarioId: randomScenario.id,
                status: 'searching'
            });
            await match.save();

            return res.status(201).json({ message: 'Entered queue', match });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Leave queue
router.post('/leave-queue', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        await Match.findOneAndDelete({ players: userId, status: 'searching' });
        res.json({ message: 'Left queue successfully' });
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
