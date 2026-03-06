import express from 'express';
import User from '../models/User.js';
import UgcScenario from '../models/UgcScenario.js';
import Team from '../models/Team.js';
import AuditLog from '../models/AuditLog.js';
import SystemSetting from '../models/SystemSetting.js';
import Event from '../models/Event.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to log admin actions
const logAction = async (admin, action, details, targetId = null) => {
    try {
        await AuditLog.create({
            adminId: admin.id,
            adminName: admin.username,
            action,
            details,
            targetId
        });
    } catch (err) {
        console.error("Audit Log Failure:", err);
    }
};

// GET /api/admin/stats — System Analytics
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        // 1. User registrations last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const registrations = await User.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 2. Popular Categories & Kill-Chain Stats (Accuracy)
        const categoryStats = await User.aggregate([
            { $unwind: "$completedScenarios" },
            {
                $group: {
                    _id: "$completedScenarios.category",
                    avgAccuracy: { $avg: "$completedScenarios.accuracy" },
                    totalAttempts: { $sum: 1 }
                }
            },
            { $sort: { totalAttempts: -1 } }
        ]);

        // 3. User distribution by Country
        const countries = await User.aggregate([
            { $group: { _id: "$country", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // 4. Summary Stats
        const totalUsers = await User.countDocuments();
        const pendingScenarios = await UgcScenario.countDocuments({ status: 'pending' });
        const liveScenarios = await UgcScenario.countDocuments({ status: 'approved' });

        res.json({
            registrations,
            categoryStats,
            countries,
            summary: {
                totalUsers,
                pendingScenarios,
                liveScenarios
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/admin/broadcast — Global System Alert
router.post('/broadcast', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { message, type = 'info' } = req.body;
        if (!message) return res.status(400).json({ message: "Message is required" });

        // Emission is handled by the main app instance via req.app.get('io')
        const io = req.app.get('io');
        if (io) {
            io.emit('system_broadcast', {
                message,
                type,
                sender: 'Headquarters',
                timestamp: new Date()
            });

            await logAction(req.user, 'broadcast', `Sent global alert: "${message.substring(0, 30)}..."`);
            res.json({ message: "Broadcast deployed successfully" });
        } else {
            res.status(500).json({ message: "Terminal broadcast link offline" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/admin/maintenance — Toggle Maintenance Mode
router.post('/maintenance', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { enabled } = req.body;

        await SystemSetting.findOneAndUpdate(
            { key: 'maintenance_mode' },
            {
                value: enabled,
                updatedBy: req.user.username,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        await logAction(req.user, 'toggle_maintenance', `Set Maintenance Mode to ${enabled}`);

        const io = req.app.get('io');
        if (io) {
            io.emit('maintenance_toggle', { enabled });
        }

        res.json({ message: `System status set to ${enabled ? 'MAINTENANCE' : 'OPERATIONAL'}`, enabled });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/admin/maintenance/status — Check current mode
router.get('/maintenance/status', authenticateToken, isAdmin, async (req, res) => {
    try {
        const maintenance = await SystemSetting.findOne({ key: 'maintenance_mode' });
        res.json({ enabled: maintenance ? maintenance.value : false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/admin/logs/:id — Remove specific log
router.delete('/logs/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await AuditLog.findByIdAndDelete(req.params.id);
        res.json({ message: "Log entry removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/admin/logs — Clear all logs
router.delete('/logs', authenticateToken, isAdmin, async (req, res) => {
    try {
        await AuditLog.deleteMany({});
        // Log this destructive action!
        await logAction(req.user, 'clear_logs', 'All audit logs were cleared from the system.');
        res.json({ message: "All logs cleared" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/admin/assets — Aggregate images for Evidence Locker
router.get('/assets', authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find({ profilePhoto: { $ne: null, $ne: '' } }, '_id username profilePhoto createdAt');
        const scenarios = await UgcScenario.find({ "visualData.imageUrl": { $exists: true, $ne: '' } }, '_id title authorId visualData createdAt');

        const assets = [];

        users.forEach(u => {
            assets.push({
                _id: u._id, // Used for deletion
                type: 'user_profile',
                url: u.profilePhoto,
                uploader: u.username,
                context: 'Profile Photo',
                date: u.createdAt
            });
        });

        scenarios.forEach(s => {
            assets.push({
                _id: s._id, // Used for deletion
                type: 'scenario_image',
                url: s.visualData.imageUrl,
                uploader: s.authorId ? s.authorId.username : 'Unknown', // Need populate or handle missing
                context: `UGC Scenario: ${s.title}`,
                date: s.createdAt
            });
        });

        // Sort newest first
        assets.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(assets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/admin/assets — Takedown an image
router.delete('/assets', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id, type } = req.body; // type is 'user_profile' or 'scenario_image'
        if (!id || !type) return res.status(400).json({ message: "Asset ID and Type are required" });

        if (type === 'user_profile') {
            const user = await User.findById(id);
            if (!user) return res.status(404).json({ message: "User not found" });
            const oldUrl = user.profilePhoto;
            user.profilePhoto = ''; // Clear it
            await user.save();
            await logAction(req.user, 'asset_takedown', `Removed profile picture for ${user.username} (${oldUrl})`);
        } else if (type === 'scenario_image') {
            const scenario = await UgcScenario.findById(id);
            if (!scenario) return res.status(404).json({ message: "Scenario not found" });
            const oldUrl = scenario.visualData.imageUrl;
            scenario.visualData.imageUrl = ''; // Clear it
            await scenario.save();
            await logAction(req.user, 'asset_takedown', `Removed image from scenario "${scenario.title}" (${oldUrl})`);
        } else {
            return res.status(400).json({ message: "Invalid asset type" });
        }

        res.json({ message: "Asset successfully taken down" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/admin/events — List all events
router.get('/events', authenticateToken, isAdmin, async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/admin/events — Create new global event
router.post('/events', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { title, description, type, multiplier, expiresAt } = req.body;
        const event = new Event({ title, description, type, multiplier, expiresAt });
        await event.save();
        
        await logAction(req.user, 'create_event', `Created ${type} event: ${title}`);
        
        // Notify via socket
        const io = req.app.get('io');
        if (io) io.emit('new_event', event);

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/admin/events/:id — Cancel an event
router.delete('/events/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        
        await logAction(req.user, 'cancel_event', `Canceled event: ${event.title}`);
        res.json({ message: 'Event canceled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /api/admin/scenarios/:id/feature — Pin/Unpin scenario
router.patch('/scenarios/:id/feature', authenticateToken, isAdmin, async (req, res) => {
    try {
        const scenario = await UgcScenario.findById(req.params.id);
        if (!scenario) return res.status(404).json({ message: 'Scenario not found' });

        scenario.isFeatured = !scenario.isFeatured;
        await scenario.save();

        await logAction(req.user, 'feature_scenario', `${scenario.isFeatured ? 'Featured' : 'Unfeatured'} scenario: ${scenario.title}`);
        res.json({ isFeatured: scenario.isFeatured });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Global Settings Routes
router.get('/settings/maintenance', authenticateToken, isAdmin, async (req, res) => {
    try {
        let setting = await SystemSetting.findOne({ key: 'maintenance_mode' });
        if (!setting) {
            setting = await SystemSetting.create({ 
                key: 'maintenance_mode', 
                value: false, 
                description: 'Global site maintenance status' 
            });
        }
        res.json({ isActive: setting.value });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/settings/maintenance', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { isActive } = req.body;
        
        // Defensive check for request body
        if (isActive === undefined) {
            console.error("Maintenance Toggle Failure: isActive is undefined in request body");
            return res.status(400).json({ message: "Payload error: isActive is required." });
        }

        const setting = await SystemSetting.findOneAndUpdate(
            { key: 'maintenance_mode' },
            { 
                $set: { 
                    value: isActive, 
                    updatedAt: new Date(), 
                    updatedBy: req.user.id 
                } 
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await logAction(
            req.user, 
            isActive ? 'maintenance_on' : 'maintenance_off', 
            `Global Maintenance Mode toggled to ${isActive ? 'ACTIVE' : 'INACTIVE'}`
        );

        res.json({ message: `Maintenance mode ${isActive ? 'activated' : 'deactivated'}`, isActive: setting.value });
    } catch (error) {
        console.error("CRITICAL ERROR: Maintenance toggle failed:", error);
        res.status(500).json({ message: "System failure during maintenance toggle: " + error.message });
    }
});

export default router;
