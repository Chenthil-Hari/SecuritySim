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

        // Calculate global rank
        const rank = await User.countDocuments({ score: { $gt: user.score } }) + 1;

        const userData = user.toObject();
        userData.rank = rank;

        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// GET /api/profile/:userId — get any user's public profile
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password -email');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Calculate global rank
        const rank = await User.countDocuments({ score: { $gt: user.score } }) + 1;
        const userData = user.toObject();
        userData.rank = rank;

        // Check relationship if requester is logged in
        userData.friendStatus = 'none';
        const tokenToken = req.headers.authorization?.split(' ')[1];
        if (tokenToken) {
            try {
                const decoded = jwt.verify(tokenToken, process.env.JWT_SECRET || 'fallback_secret');
                const requesterId = decoded.userId;

                if (user.friends.some(f => f.toString() === requesterId)) {
                    userData.friendStatus = 'friends';
                } else {
                    const requester = await User.findById(requesterId);
                    const isPending = user.friendRequests.some(r => r.from.toString() === requesterId);
                    const sentToRequester = requester?.friendRequests.some(r => r.from.toString() === user._id.toString());

                    if (isPending || sentToRequester) {
                        userData.friendStatus = 'pending';
                    }
                }
            } catch (authErr) {
                // Ignore auth error for public profile
            }
        }

        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// PUT /api/profile/sync — sync game state from frontend to DB
router.put('/sync', authMiddleware, async (req, res) => {
    try {
        const { score, incrementalScore, xp, level, badges, completedScenarios, skillPoints, unlockedSkills, weeklyCompleted, teamId, customization, unlockedTitles, seasonalMedals } = req.body;
        const updateData = {};
        const incData = {};

        if (score !== undefined) updateData.score = score;
        if (incrementalScore !== undefined) {
             // Incremental score adds to existing rather than overriding
             incData.score = incrementalScore;
        }
        if (xp !== undefined) updateData.xp = xp;
        if (level !== undefined) updateData.level = level;
        if (badges !== undefined) updateData.badges = badges;
        if (completedScenarios !== undefined) updateData.completedScenarios = completedScenarios;
        if (skillPoints !== undefined) updateData.skillPoints = skillPoints;
        if (unlockedSkills !== undefined) updateData.unlockedSkills = unlockedSkills;
        if (weeklyCompleted !== undefined) updateData.weeklyCompleted = weeklyCompleted;
        if (teamId !== undefined) updateData.teamId = teamId;
        if (customization !== undefined) updateData.customization = customization;
        if (unlockedTitles !== undefined) updateData.unlockedTitles = unlockedTitles;
        if (seasonalMedals !== undefined) updateData.seasonalMedals = seasonalMedals;

        const updateOperation = {};
        if (Object.keys(updateData).length > 0) updateOperation.$set = updateData;
        if (Object.keys(incData).length > 0) updateOperation.$inc = incData;

        // If nothing to update, return early
        if (Object.keys(updateOperation).length === 0) {
             return res.json({ message: 'No updates provided' });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            updateOperation,
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

// GET /api/profile/search/:username — search users by username
router.get('/search/:username', authMiddleware, async (req, res) => {
    try {
        const users = await User.find({
            username: { $regex: req.params.username, $options: 'i' },
            _id: { $ne: req.userId }
        })
            .select('username profilePhoto level country score')
            .limit(10);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error searching users', error: error.message });
    }
});

export default router;
