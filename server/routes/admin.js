import express from 'express';
import User from '../models/User.js';
import UgcScenario from '../models/UgcScenario.js';
import AuditLog from '../models/AuditLog.js';
import SystemSetting from '../models/SystemSetting.js';
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
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }},
            { $sort: { "_id": 1 } }
        ]);

        // 2. Popular Categories & Kill-Chain Stats (Accuracy)
        const categoryStats = await User.aggregate([
            { $unwind: "$completedScenarios" },
            { $group: {
                _id: "$completedScenarios.category",
                avgAccuracy: { $avg: "$completedScenarios.accuracy" },
                totalAttempts: { $sum: 1 }
            }},
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

// GET /api/admin/logs — Audit Logs
router.get('/logs', authenticateToken, isAdmin, async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
