import express from 'express';
import WarRoom from '../models/WarRoom.js';
import ChatMessage from '../models/ChatMessage.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create or join a war room
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, teamId, scenarioId, scenarioType } = req.body;

        // Check if an active war room already exists for this team and scenario
        let warRoom = await WarRoom.findOne({ teamId, scenarioId, status: 'active' });

        if (!warRoom) {
            warRoom = new WarRoom({
                name,
                teamId,
                scenarioId,
                scenarioType,
                activeParticipants: [req.user.id],
                evidenceBoard: { items: [] }
            });
            await warRoom.save();
        } else {
            // Add user to active participants if not already there
            if (!warRoom.activeParticipants.includes(req.user.id)) {
                warRoom.activeParticipants.push(req.user.id);
                await warRoom.save();
            }
        }

        res.status(201).json(warRoom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get war room state
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const warRoom = await WarRoom.findById(req.params.id)
            .populate('activeParticipants', 'username profilePhoto');
        
        if (!warRoom) return res.status(404).json({ message: 'War room not found' });
        
        // Get recent chat messages
        const messages = await ChatMessage.find({ warRoomId: warRoom._id })
            .sort({ timestamp: 1 })
            .limit(100);

        res.json({ warRoom, messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update evidence board
router.patch('/:id/evidence', authenticateToken, async (req, res) => {
    try {
        const { evidence } = req.body;
        const warRoom = await WarRoom.findByIdAndUpdate(
            req.params.id,
            { evidenceBoard: evidence },
            { new: true }
        );
        res.json(warRoom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
