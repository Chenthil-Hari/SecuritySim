import express from 'express';
import WarRoom from '../models/WarRoom.js';
import Team from '../models/Team.js';
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
            // AUTH CHECK: Only Owner or Principal Investigator can launch (create) a new war room
            const team = await Team.findById(teamId);
            if (!team) return res.status(404).json({ message: 'Team not found' });

            const isOwner = team.ownerId.toString() === req.user.id.toString();
            const userRole = team.memberRoles.find(r => r.userId.toString() === req.user.id.toString())?.role;
            const isPI = userRole === 'Principal Investigator';

            if (!isOwner && !isPI) {
                return res.status(403).json({ message: 'Only Team Owner or Principal Investigators can launch new operations.' });
            }

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

        const populatedWarRoom = await WarRoom.findById(warRoom._id)
            .populate('activeParticipants', 'username profilePhoto');

        res.status(201).json(populatedWarRoom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get war room state
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const warRoom = await WarRoom.findById(req.params.id)
            .populate('teamId')
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

// Advance scenario state
router.patch('/:id/advance', authenticateToken, async (req, res) => {
    try {
        const { nextNodeId, historyItem } = req.body;
        const update = { currentNodeId: nextNodeId };
        
        if (historyItem) {
            update.$push = { history: historyItem };
        }

        const warRoom = await WarRoom.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        );
        res.json(warRoom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Close war room (Owner/PI only)
router.patch('/:id/close', authenticateToken, async (req, res) => {
    try {
        const warRoom = await WarRoom.findById(req.params.id);
        if (!warRoom) return res.status(404).json({ message: 'War room not found' });

        const team = await Team.findById(warRoom.teamId);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        const isOwner = team.ownerId.toString() === req.user.id.toString();
        const userRole = team.memberRoles.find(r => r.userId.toString() === req.user.id.toString())?.role;
        const isPI = userRole === 'Principal Investigator';

        if (!isOwner && !isPI) {
            return res.status(403).json({ message: 'Only Team Owner or Principal Investigators can terminate operations.' });
        }

        warRoom.status = 'completed';
        warRoom.completedAt = new Date();
        warRoom.activeParticipants = [];
        await warRoom.save();

        // Get IO instance to broadcast termination
        const io = req.app.get('io');
        if (io) {
            io.to(warRoom._id.toString()).emit('session_terminated');
        }

        res.json({ message: 'Operations terminated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
