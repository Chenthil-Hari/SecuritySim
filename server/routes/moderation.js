const express = require('require');
const router = express.Router();
const Report = require('../models/Report');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Assuming auth
const adminAuth = require('../middleware/adminAuth'); // Assuming admin Auth

// User submits a report
router.post('/report', auth, async (req, res) => {
    try {
        const { reportedItemId, itemModel, reason } = req.body;

        if (!reportedItemId || !itemModel || !reason) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newReport = new Report({
            reporterId: req.user.id,
            reportedItemId,
            itemModel,
            reason
        });

        await newReport.save();
        res.status(201).json({ message: 'Report submitted successfully' });
    } catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).json({ error: 'Failed to submit report' });
    }
});

// Admin fetches pending reports
router.get('/reports', [auth, adminAuth], async (req, res) => {
    try {
        const reports = await Report.find({ status: 'Pending' })
            .sort({ createdAt: -1 })
            .populate('reporterId', 'username email')
            .populate({
                path: 'reportedItemId',
                // Populate the author of the reported content
                populate: { path: 'userId', select: 'username email' }
            });
            
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// Admin resolves a report
router.post('/resolve/:id', [auth, adminAuth], async (req, res) => {
    try {
        const { action, resolutionNotes } = req.body;
        // actions: 'DISMISS', 'DELETE_CONTENT', 'BAN_USER', 'DELETE_USER'

        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        report.status = 'Resolved';
        report.resolutionNotes = resolutionNotes || '';
        report.resolvedAt = Date.now();
        await report.save();

        const model = report.itemModel === 'Post' ? Post : Comment;
        const item = await model.findById(report.reportedItemId);

        if (!item) {
             return res.json({ message: 'Report resolved, item was already deleted.' });
        }

        if (action === 'DELETE_CONTENT' || action === 'BAN_USER' || action === 'DELETE_USER') {
            item.isDeleted = true;
            await item.save();
        }

        if (action === 'BAN_USER') {
             const user = await User.findById(item.userId);
             if (user) {
                 user.status = 'suspended'; // Assuming status field exists
                 await user.save();
             }
        } else if (action === 'DELETE_USER') {
             await User.findByIdAndDelete(item.userId);
             // Caution: Should ideally cascade delete user's content, 
             // but keeping it simple based on reqs
        }

        res.json({ message: 'Report resolved successfully' });
    } catch (error) {
        console.error('Error resolving report:', error);
        res.status(500).json({ error: 'Failed to resolve report' });
    }
});

// Admin fetching all global messages
router.get('/all-messages', [auth, adminAuth], async (req, res) => {
    try {
        const posts = await Post.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .populate('userId', 'username email')
            .populate({
                path: 'comments',
                match: { isDeleted: false },
                populate: { path: 'userId', select: 'username email' }
            });
            
        res.json(posts);
    } catch (error) {
        console.error('Error fetching all messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

module.exports = router;
