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

// GET /api/profile/me — get current user's profile
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// GET /api/profile/:userId — get any user's public profile
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password -email');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// PUT /api/profile/sync — sync game state from frontend to DB
router.put('/sync', authMiddleware, async (req, res) => {
    try {
        const { score, xp, level, badges, completedScenarios } = req.body;
        const updateData = {};

        if (score !== undefined) updateData.score = score;
        if (xp !== undefined) updateData.xp = xp;
        if (level !== undefined) updateData.level = level;
        if (badges !== undefined) updateData.badges = badges;
        if (completedScenarios !== undefined) updateData.completedScenarios = completedScenarios;

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Profile synced successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error syncing profile', error: error.message });
    }
});

// PUT /api/profile/edit — update username, profile photo, and country
router.put('/edit', authMiddleware, async (req, res) => {
    try {
        const { username, profilePhoto, country } = req.body;
        const updateData = {};

        if (username) {
            // Check if username is taken by another user
            const existingUser = await User.findOne({ username, _id: { $ne: req.userId } });
            if (existingUser) return res.status(400).json({ message: 'Username is already taken' });
            updateData.username = username;
        }

        if (profilePhoto !== undefined) {
            updateData.profilePhoto = profilePhoto;
        }

        if (country !== undefined) {
            updateData.country = country;
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

export default router;
