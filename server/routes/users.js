import express from 'express';
import User from '../models/User.js';
import Team from '../models/Team.js';
import SupportTicket from '../models/SupportTicket.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import { logAction } from '../utils/logger.js';

const router = express.Router();

// Check current user status (Frozen/Level etc)
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('isFrozen role lastSeen');
        res.json({ isFrozen: user.isFrozen, role: user.role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Heartbeat endpoint to update activity
router.post('/heartbeat', authenticateToken, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { lastSeen: new Date() });
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all users (Admin only)
router.get('/admin/all', authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '-password')
            .populate('teamId', 'name')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Toggle user frozen status (Admin only)
router.patch('/admin/:id/freeze', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { adminDisplayName } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent admin from freezing themselves
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot freeze an administrator' });
        }

        user.isFrozen = !user.isFrozen;
        await user.save();

        await logAction(
            req.user, 
            user.isFrozen ? 'freeze_user' : 'unfreeze_user', 
            `${user.isFrozen ? 'Frozen' : 'Unfrozen'} access for agent: ${user.username}`, 
            user._id, 
            adminDisplayName
        );

        res.json({ message: `User ${user.isFrozen ? 'frozen' : 'unfrozen'} successfully`, isFrozen: user.isFrozen });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reset user password (Admin only)
router.post('/admin/:id/reset-password', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { adminDisplayName } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate a random 8-character password
        const tempPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(tempPassword, salt);

        await user.save();

        await logAction(
            req.user, 
            'reset_password', 
            `Issued emergency password reset for agent: ${user.username}`, 
            user._id, 
            adminDisplayName
        );

        res.json({
            message: 'Password reset successful',
            tempPassword // In a real app, this should be sent via email
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Toggle showInLeaderboard status (Admin only)
router.patch('/admin/:id/leaderboard-toggle', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { adminDisplayName } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.showInLeaderboard = !user.showInLeaderboard;
        await user.save();

        await logAction(
            req.user, 
            'leaderboard_toggle', 
            `${user.showInLeaderboard ? 'Restored' : 'Removed'} ${user.username} ${user.showInLeaderboard ? 'to' : 'from'} leaderboard`, 
            user._id, 
            adminDisplayName
        );

        res.json({ 
            message: `User ${user.showInLeaderboard ? 'restored to' : 'removed from'} leaderboard successfully`, 
            showInLeaderboard: user.showInLeaderboard 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Submit a support ticket (Authenticated Users)
router.post('/contact', authenticateToken, async (req, res) => {
    try {
        const { subject, message } = req.body;
        if (!subject || !message) {
            return res.status(400).json({ message: 'Subject and message are required' });
        }

        const ticket = new SupportTicket({
            user: req.user.id,
            subject,
            message
        });

        await ticket.save();
        res.status(201).json({ message: 'Message sent successfully to HQ.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
