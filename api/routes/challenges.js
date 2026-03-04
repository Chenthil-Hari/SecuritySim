import express from 'express';
import jwt from 'jsonwebtoken';
import Challenge from '../models/Challenge.js';
import User from '../models/User.js';

const router = express.Router();

// Auth middleware
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

// POST /api/challenges/create
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { receiverUsername, scenarioId, senderAccuracy, senderXp } = req.body;

        if (receiverUsername.toLowerCase() === req.user?.username?.toLowerCase() || !receiverUsername) {
            return res.status(400).json({ message: 'Invalid opponent username.' });
        }

        const receiver = await User.findOne({ username: new RegExp(`^${receiverUsername}$`, 'i') });
        if (!receiver) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (receiver._id.toString() === req.userId) {
            return res.status(400).json({ message: 'You cannot challenge yourself.' });
        }

        const newChallenge = new Challenge({
            senderId: req.userId,
            receiverId: receiver._id,
            scenarioId,
            senderAccuracy,
            senderXp
        });

        await newChallenge.save();

        res.status(201).json({ message: 'Challenge sent successfully!', challenge: newChallenge });
    } catch (error) {
        res.status(500).json({ message: 'Error sending challenge', error: error.message });
    }
});

// GET /api/challenges
// Fetches both incoming and outgoing challenges for the current user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const incoming = await Challenge.find({ receiverId: req.userId, status: 'pending' })
            .populate('senderId', 'username profilePhoto level')
            .sort({ createdAt: -1 });

        const history = await Challenge.find({
            $or: [{ receiverId: req.userId }, { senderId: req.userId }],
            status: { $in: ['completed', 'declined'] }
        })
            .populate('senderId', 'username')
            .populate('receiverId', 'username')
            .sort({ completedAt: -1, createdAt: -1 })
            .limit(20);

        const outgoing = await Challenge.find({ senderId: req.userId, status: 'pending' })
            .populate('receiverId', 'username')
            .sort({ createdAt: -1 });

        res.json({ incoming, outgoing, history });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching challenges', error: error.message });
    }
});

// PUT /api/challenges/:id/complete
router.put('/:id/complete', authMiddleware, async (req, res) => {
    try {
        const { receiverAccuracy, receiverXp } = req.body;
        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found.' });
        }

        if (challenge.receiverId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Unauthorized to complete this challenge.' });
        }

        if (challenge.status !== 'pending') {
            return res.status(400).json({ message: 'This challenge is no longer active.' });
        }

        challenge.receiverAccuracy = receiverAccuracy;
        challenge.receiverXp = receiverXp;
        challenge.status = 'completed';
        challenge.completedAt = new Date();

        await challenge.save();

        // Determine winner
        let resultMessage = "It's a tie!";
        if (receiverAccuracy > challenge.senderAccuracy) {
            resultMessage = "You won the challenge!";
        } else if (challenge.senderAccuracy > receiverAccuracy) {
            resultMessage = "You lost the challenge.";
        }

        res.json({ message: resultMessage, challenge });
    } catch (error) {
        res.status(500).json({ message: 'Error completing challenge', error: error.message });
    }
});

// PUT /api/challenges/:id/decline
router.put('/:id/decline', authMiddleware, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) return res.status(404).json({ message: 'Challenge not found.' });

        if (challenge.receiverId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        challenge.status = 'declined';
        challenge.completedAt = new Date();
        await challenge.save();

        res.json({ message: 'Challenge declined.' });
    } catch (error) {
        res.status(500).json({ message: 'Error declining challenge', error: error.message });
    }
});

export default router;
