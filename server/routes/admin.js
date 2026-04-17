import express from 'express';
import User from '../models/User.js';
import UgcScenario from '../models/UgcScenario.js';
import Team from '../models/Team.js';
import AuditLog from '../models/AuditLog.js';
import SystemSetting from '../models/SystemSetting.js';
import Event from '../models/Event.js';
import NewsItem from '../models/NewsItem.js';
import SupportTicket from '../models/SupportTicket.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { logAction } from '../utils/logger.js';

const router = express.Router();

// Helper to log admin actions

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
        const { message, type = 'info', adminDisplayName } = req.body;
        if (!message) return res.status(400).json({ message: "Message is required" });

        // Emission is handled by the main main app instance via req.app.get('io')
        const io = req.app.get('io');
        if (io) {
            console.log(`📣 Broadcasting message: "${message.substring(0, 30)}..." [Type: ${type}]`);
            io.emit('system_broadcast', {
                message,
                type,
                sender: 'Headquarters',
                timestamp: new Date()
            });

            await logAction(req.user, 'broadcast', `Sent global alert: "${message.substring(0, 30)}..."`, null, adminDisplayName);
            res.json({ message: "Broadcast deployed successfully" });
        } else {
            console.error("❌ Socket.io instance NOT found on req.app");
            res.status(500).json({ message: "Terminal broadcast link offline (Socket server error)" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/admin/maintenance — Toggle Maintenance Mode
router.post('/maintenance', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { enabled, adminDisplayName } = req.body;

        await SystemSetting.findOneAndUpdate(
            { key: 'maintenance_mode' },
            {
                value: enabled,
                updatedBy: req.user.username,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        await logAction(req.user, 'toggle_maintenance', `Set Maintenance Mode to ${enabled}`, null, adminDisplayName);

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
        const { adminDisplayName } = req.body;
        const log = await AuditLog.findById(req.params.id);
        if (log) {
            await logAction(req.user, 'delete_log', `Removed specific log entry: ${log.action} by ${log.adminName}`, req.params.id, adminDisplayName);
            await AuditLog.findByIdAndDelete(req.params.id);
        }
        res.json({ message: "Log entry removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/admin/logs — Clear all logs
router.delete('/logs', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { adminDisplayName } = req.body;
        await AuditLog.deleteMany({});
        // Log this destructive action!
        await logAction(req.user, 'clear_logs', 'All audit logs were cleared from the system.', null, adminDisplayName);
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
        const { id, type, adminDisplayName } = req.body; // type is 'user_profile' or 'scenario_image'
        if (!id || !type) return res.status(400).json({ message: "Asset ID and Type are required" });

        if (type === 'user_profile') {
            const user = await User.findById(id);
            if (!user) return res.status(404).json({ message: "User not found" });
            const oldUrl = user.profilePhoto;
            user.profilePhoto = ''; // Clear it
            await user.save();
            await logAction(req.user, 'asset_takedown', `Removed profile picture for ${user.username} (${oldUrl})`, id, adminDisplayName);
        } else if (type === 'scenario_image') {
            const scenario = await UgcScenario.findById(id);
            if (!scenario) return res.status(404).json({ message: "Scenario not found" });
            const oldUrl = scenario.visualData.imageUrl;
            scenario.visualData.imageUrl = ''; // Clear it
            await scenario.save();
            await logAction(req.user, 'asset_takedown', `Removed image from scenario "${scenario.title}" (${oldUrl})`, id, adminDisplayName);
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
        const { title, description, type, multiplier, expiresAt, adminDisplayName } = req.body;
        const event = new Event({ title, description, type, multiplier, expiresAt });
        await event.save();
        
        await logAction(req.user, 'create_event', `Created ${type} event: ${title}`, event._id, adminDisplayName);
        
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
        const { adminDisplayName } = req.body;
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        
        await logAction(req.user, 'cancel_event', `Canceled event: ${event.title}`, req.params.id, adminDisplayName);
        res.json({ message: 'Event canceled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /api/admin/scenarios/:id/feature — Pin/Unpin scenario
router.patch('/scenarios/:id/feature', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { adminDisplayName } = req.body;
        const scenario = await UgcScenario.findById(req.params.id);
        if (!scenario) return res.status(404).json({ message: 'Scenario not found' });

        scenario.isFeatured = !scenario.isFeatured;
        await scenario.save();

        await logAction(req.user, 'feature_scenario', `${scenario.isFeatured ? 'Featured' : 'Unfeatured'} scenario: ${scenario.title}`, scenario._id, adminDisplayName);
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
                value: { isActive: false, expectedReturn: '' }, // Structured value
                description: 'Global site maintenance status' 
            });
        }
        
        // Handle both old boolean format and new object format
        const isActive = typeof setting.value === 'boolean' ? setting.value : setting.value.isActive;
        const expectedReturn = typeof setting.value === 'object' ? setting.value.expectedReturn : '';

        res.json({ isActive, expectedReturn });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/settings/maintenance', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { isActive, expectedReturn, adminDisplayName } = req.body;
        
        if (isActive === undefined) {
            return res.status(400).json({ message: "Payload error: isActive is required." });
        }

        const setting = await SystemSetting.findOneAndUpdate(
            { key: 'maintenance_mode' },
            { 
                $set: { 
                    value: { isActive, expectedReturn }, 
                    updatedAt: new Date(), 
                    updatedBy: req.user.id 
                } 
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await logAction(
            req.user, 
            isActive ? 'maintenance_on' : 'maintenance_off', 
            `Global Maintenance Mode toggled to ${isActive ? 'ACTIVE' : 'INACTIVE'}${expectedReturn ? ` (Expected Return: ${expectedReturn})` : ''}`,
            null,
            adminDisplayName
        );

        res.json({ 
            message: `Maintenance mode ${isActive ? 'activated' : 'deactivated'}`, 
            isActive,
            expectedReturn
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Feature Toggles ---
router.get('/settings/features', authenticateToken, isAdmin, async (req, res) => {
    try {
        let setting = await SystemSetting.findOne({ key: 'feature_toggles' });
        if (!setting) {
            setting = await SystemSetting.create({
                key: 'feature_toggles',
                value: {
                    teams: true,
                    warrooms: true,
                    pvp: true,
                    ugc: true,
                    threat_map: true
                },
                description: 'Enable/Disable platform features'
            });
        }
        res.json(setting.value);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/settings/features', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { toggles, adminDisplayName } = req.body;
        const setting = await SystemSetting.findOneAndUpdate(
            { key: 'feature_toggles' },
            { $set: { value: toggles, updatedAt: new Date(), updatedBy: req.user.id } },
            { upsert: true, new: true }
        );
        await logAction(req.user, 'update_features', `Updated feature toggles: ${Object.keys(toggles).filter(k => toggles[k]).join(', ')}`, null, adminDisplayName);
        res.json(setting.value);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Global News Manager ---
router.get('/news/admin', authenticateToken, isAdmin, async (req, res) => {
    try {
        const news = await NewsItem.find().sort({ createdAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/news', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { title, message, type, priority, expiresAt, adminDisplayName } = req.body;
        const news = new NewsItem({
            title,
            message,
            type,
            priority,
            expiresAt,
            createdBy: req.user.id
        });
        await news.save();
        await logAction(req.user, 'create_news', `Created news: ${title}`, null, adminDisplayName);
        res.status(201).json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/news/:id/toggle', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { adminDisplayName } = req.body;
        const news = await NewsItem.findById(req.params.id);
        if (!news) return res.status(404).json({ message: 'News item not found' });
        news.isActive = !news.isActive;
        await news.save();
        
        await logAction(req.user, 'toggle_news', `${news.isActive ? 'Activated' : 'Deactivated'} news item: ${news.title}`, news._id, adminDisplayName);
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/news/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { adminDisplayName } = req.body;
        const news = await NewsItem.findById(req.params.id);
        if (news) {
            await logAction(req.user, 'delete_news', `Deleted news item: ${news.title}`, req.params.id, adminDisplayName);
            await NewsItem.findByIdAndDelete(req.params.id);
        }
        res.json({ message: 'News item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- User Enforcement (Banning) ---
router.patch('/users/:id/ban', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { reason, adminDisplayName } = req.body;
        if (!reason) return res.status(400).json({ message: "Ban reason is required" });

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role === 'admin') {
            return res.status(403).json({ message: "Cannot ban an administrator" });
        }

        user.isBanned = true;
        user.banReason = reason;
        user.enforcementHistory.push({
            action: 'ban',
            reason,
            adminName: adminDisplayName || req.user.username,
            timestamp: new Date()
        });

        await user.save();
        await logAction(req.user, 'ban_user', `Banned user ${user.username}. Reason: ${reason}`, user._id, adminDisplayName);

        res.json({ message: `User ${user.username} has been permanently banned`, isBanned: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/users/:id/unban', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { adminDisplayName } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isBanned = false;
        user.enforcementHistory.push({
            action: 'unban',
            reason: 'Enforcement action lifted by administrator',
            adminName: adminDisplayName || req.user.username,
            timestamp: new Date()
        });

        await user.save();
        await logAction(req.user, 'unban_user', `Lifted ban for user ${user.username}`, user._id, adminDisplayName);

        res.json({ message: `Ban lifted for user ${user.username}`, isBanned: false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /api/admin/users/:id/verify — Force verify an agent
router.patch('/users/:id/verify', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { adminDisplayName } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isVerified = true;
        user.verificationOTP = undefined;
        user.verificationOTPExpires = undefined;
        
        user.enforcementHistory.push({
            action: 'force_verify',
            reason: 'Manual identity verification override by administrator',
            adminName: adminDisplayName || req.user.username,
            timestamp: new Date()
        });

        await user.save();
        await logAction(req.user, 'force_verify', `Manually verified identity for user ${user.username}`, user._id, adminDisplayName);

        res.json({ message: `Identity verified for user ${user.username}`, isVerified: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/admin/vitals — Server Health Metrics
router.get('/vitals', authenticateToken, isAdmin, async (req, res) => {
    try {
        const db = User.db.db;
        const stats = await db.stats();
        const serverStatus = await db.admin().serverStatus();
        
        res.json({
            database: {
                name: stats.db,
                collections: stats.collections,
                objects: stats.objects,
                avgObjSize: (stats.avgObjSize / 1024).toFixed(2) + " KB",
                dataSize: (stats.dataSize / (1024 * 1024)).toFixed(2) + " MB",
                storageSize: (stats.storageSize / (1024 * 1024)).toFixed(2) + " MB",
                indexSize: (stats.indexSize / (1024 * 1024)).toFixed(2) + " MB"
            },
            server: {
                version: serverStatus.version,
                uptime: Math.floor(serverStatus.uptime / 3600) + " Hours",
                connections: {
                    current: serverStatus.connections.current,
                    available: serverStatus.connections.available
                },
                mem: {
                    resident: serverStatus.mem.resident + " MB",
                    virtual: serverStatus.mem.virtual + " MB"
                }
            },
            timestamp: new Date()
        });
    } catch (error) {
        console.error("Vitals Error:", error);
        res.status(500).json({ message: "Failed to probe server vitals" });
    }
});

// POST /api/admin/vitals/recalculate-scores — Maintenance Sync
router.post('/vitals/recalculate-scores', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { adminDisplayName } = req.body;
        let userAdjustments = 0;
        let teamAdjustments = 0;

        // 1. Sync User Levels/XP
        const users = await User.find({});
        for (const user of users) {
            const expectedLevel = Math.floor((user.xp || 0) / 100) + 1;
            if (user.level !== expectedLevel) {
                user.level = expectedLevel;
                await user.save();
                userAdjustments++;
            }
        }

        // 2. Sync Team Scores
        const teams = await Team.find({});
        for (const team of teams) {
            const members = await User.find({ teamId: team._id });
            const calculatedScore = members.reduce((sum, m) => sum + (m.score || 0), 0);
            if (team.totalScore !== calculatedScore) {
                team.totalScore = calculatedScore;
                await team.save();
                teamAdjustments++;
            }
        }

        await logAction(req.user, 'SYSTEM_MAINTENANCE', `Manual Score Sync complete. Adjustments: ${userAdjustments} agents, ${teamAdjustments} teams.`, null, adminDisplayName);

        res.json({
            message: "Data integrity restored.",
            results: {
                usersAdjusted: userAdjustments,
                teamsAdjusted: teamAdjustments
            }
        });
    } catch (error) {
        console.error("Sync Error:", error);
        res.status(500).json({ message: "Score synchronization failed due to internal error." });
    }
});

// GET /api/admin/cron/weekly-debrief — Send weekly emails and reset counters
router.get('/cron/weekly-debrief', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        // Basic security check (in production, use a secure CRON_SECRET env variable)
        if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'fallback_cron_secret'}`) {
             return res.status(401).json({ message: 'Unauthorized cron request' });
        }

        const users = await User.find({ weeklyXp: { $gt: 0 } });
        let emailsSent = 0;

        const { sendEmail, emailTemplates } = await import('../utils/mail.js');

        for (const user of users) {
            if (user.email) {
                await sendEmail(
                    user.email,
                    '📊 Weekly Agent Debriefing',
                    emailTemplates.weeklyDebriefEmail(user.username, user.weeklyXp, user.weeklyScenarios)
                ).catch(err => console.error('Failed to send weekly debrief to:', user.email, err));
                emailsSent++;
            }
            
            // Reset counters
            user.weeklyXp = 0;
            user.weeklyScenarios = 0;
            await user.save();
        }

        res.json({ message: 'Weekly debriefs processed successfully', usersProcessed: users.length, emailsSent });
    } catch (error) {
        console.error('Weekly Debrief Cron Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// POST /api/admin/email-broadcast — Send targeted or mass emails
router.post('/email-broadcast', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { target, targetEmail, subject, messageBody, announcementType, adminDisplayName } = req.body;
        // target: 'all' | 'single'

        if (!subject || !messageBody) {
            return res.status(400).json({ message: 'Subject and message body are required' });
        }

        const { sendEmail, emailTemplates } = await import('../utils/mail.js');

        // Build the HTML from the announcement template
        const emailHtml = emailTemplates.adminBroadcastEmail(subject, messageBody, announcementType);

        let emailsSent = 0;
        let failedEmails = 0;

        if (target === 'all') {
            const allUsers = await User.find({ isBanned: { $ne: true } }).select('email username');
            for (const u of allUsers) {
                if (u.email) {
                    const result = await sendEmail(u.email, subject, emailHtml).catch(() => ({ success: false }));
                    if (result.success) emailsSent++;
                    else failedEmails++;
                }
            }
        } else if (target === 'single') {
            if (!targetEmail) return res.status(400).json({ message: 'Target email or username is required' });

            // Try finding by email first, then by username
            let targetUser = await User.findOne({ email: targetEmail.toLowerCase() });
            if (!targetUser) {
                targetUser = await User.findOne({ username: { $regex: new RegExp(`^${targetEmail}$`, 'i') } });
            }
            if (!targetUser) {
                return res.status(404).json({ message: `No user found with email/username: ${targetEmail}` });
            }

            const result = await sendEmail(targetUser.email, subject, emailHtml).catch(() => ({ success: false }));
            if (result.success) emailsSent++;
            else failedEmails++;
        } else {
            return res.status(400).json({ message: 'Invalid target. Use "all" or "single".' });
        }

        await logAction(req.user, 'email_broadcast', `Sent "${subject}" to ${target === 'all' ? 'ALL users' : targetEmail} (${emailsSent} sent, ${failedEmails} failed)`, null, adminDisplayName);

        res.json({ message: 'Email broadcast completed', emailsSent, failedEmails });
    } catch (error) {
        console.error('Email Broadcast Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/admin/messages — Get all support tickets
router.get('/messages', authenticateToken, isAdmin, async (req, res) => {
    try {
        const tickets = await SupportTicket.find()
            .populate('user', 'username email')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/admin/messages/:id/reply — Reply to a support ticket
router.post('/messages/:id/reply', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { reply, adminDisplayName } = req.body;
        if (!reply) return res.status(400).json({ message: 'Reply message is required' });

        const ticket = await SupportTicket.findById(req.params.id).populate('user', 'username email');
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        
        if (ticket.status === 'replied') {
            return res.status(400).json({ message: 'Ticket has already been replied to' });
        }

        ticket.reply = reply;
        ticket.status = 'replied';
        ticket.repliedBy = adminDisplayName || req.user.username;
        ticket.repliedAt = new Date();
        await ticket.save();

        // Send Email
        if (ticket.user && ticket.user.email) {
            const { sendEmail, emailTemplates } = await import('../utils/mail.js');
            const emailHtml = emailTemplates.supportReplyEmail(ticket.user.username, ticket.message, reply, adminDisplayName);
            await sendEmail(ticket.user.email, `RE: ${ticket.subject}`, emailHtml).catch(err => console.error("Support Email Send Error:", err));
        }

        await logAction(req.user, 'support_reply', `Replied to ticket from ${ticket.user?.username || 'Unknown'}`, ticket._id, adminDisplayName);

        res.json({ message: 'Reply sent successfully', ticket });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
