import express from 'express';
import jwt from 'jsonwebtoken';
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

// GET /api/friends — get user's friend list
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate('friends', 'username profilePhoto level score country');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.friends);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching friends', error: error.message });
    }
});

// GET /api/friends/requests — get pending requests
router.get('/requests', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate('friendRequests.from', 'username profilePhoto level country');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.friendRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests', error: error.message });
    }
});

// POST /api/friends/request/:username — send friend request
router.post('/request/:username', authMiddleware, async (req, res) => {
    try {
        const targetUser = await User.findOne({ username: req.params.username });
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        if (targetUser._id.toString() === req.userId) {
            return res.status(400).json({ message: 'You cannot add yourself' });
        }

        // Check if already friends
        if (targetUser.friends.includes(req.userId)) {
            return res.status(400).json({ message: 'Already friends' });
        }

        // Check if request already exists
        const existingRequest = targetUser.friendRequests.find(r => r.from.toString() === req.userId);
        if (existingRequest) {
            return res.status(400).json({ message: 'Request already pending' });
        }

        targetUser.friendRequests.push({ from: req.userId });
        await targetUser.save();

        res.json({ message: 'Friend request sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending request', error: error.message });
    }
});

// PUT /api/friends/request/:requestId/respond — accept or reject
router.put('/request/:requestId/respond', authMiddleware, async (req, res) => {
    try {
        const { action } = req.body; // 'accept' or 'reject'
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const requestIndex = user.friendRequests.findIndex(r => r._id.toString() === req.params.requestId);
        if (requestIndex === -1) return res.status(404).json({ message: 'Request not found' });

        const requesterId = user.friendRequests[requestIndex].from;

        if (action === 'accept') {
            // Add to both friends lists
            user.friends.push(requesterId);
            const requester = await User.findById(requesterId);
            if (requester) {
                requester.friends.push(user._id);
                await requester.save();
            }
        }

        // Remove the request
        user.friendRequests.splice(requestIndex, 1);
        await user.save();

        res.json({ message: `Request ${action === 'accept' ? 'accepted' : 'rejected'}` });
    } catch (error) {
        res.status(500).json({ message: 'Error responding to request', error: error.message });
    }
});

// DELETE /api/friends/:friendId — remove friend
router.delete('/:friendId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const friend = await User.findById(req.params.friendId);

        if (!user || !friend) return res.status(404).json({ message: 'User not found' });

        user.friends = user.friends.filter(f => f.toString() !== req.params.friendId);
        friend.friends = friend.friends.filter(f => f.toString() !== req.userId);

        await user.save();
        await friend.save();

        res.json({ message: 'Friend removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing friend', error: error.message });
    }
});

export default router;
