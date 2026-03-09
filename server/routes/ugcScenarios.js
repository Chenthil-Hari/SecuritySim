import express from 'express';
import UgcScenario from '../models/UgcScenario.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../utils/mail.js';

const router = express.Router();

// Create a new scenario
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, category, difficulty, description, content } = req.body;
        
        const newScenario = new UgcScenario({
            authorId: req.user.id,
            title,
            category,
            difficulty,
            description,
            content,
            published: false, // Must be approved by admin
            status: 'pending' 
        });

        const savedScenario = await newScenario.save();
        res.status(201).json(savedScenario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all published scenarios
router.get('/', async (req, res) => {
    try {
        const scenarios = await UgcScenario.find({ status: 'approved', published: true })
            .populate('authorId', 'username profilePhoto')
            .sort({ createdAt: -1 });
        res.json(scenarios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/ugc-scenarios/featured — Get pinned scenarios
router.get('/featured', async (req, res) => {
    try {
        const scenarios = await UgcScenario.find({ isFeatured: true, status: 'approved' })
            .populate('authorId', 'username profilePhoto')
            .limit(5);
        res.json(scenarios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get scenario by ID
router.get('/:id', async (req, res) => {
    try {
        const scenario = await UgcScenario.findById(req.params.id)
            .populate('authorId', 'username profilePhoto');
        if (!scenario) return res.status(404).json({ message: 'Scenario not found' });
        res.json(scenario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADMIN ROUTES
// Get all pending scenarios
router.get('/admin/pending', authenticateToken, isAdmin, async (req, res) => {
    try {
        const scenarios = await UgcScenario.find({ status: 'pending' })
            .populate('authorId', 'username profilePhoto email')
            .sort({ createdAt: 1 }); // Oldest first for queue
        res.json(scenarios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin get live (approved) scenarios for bounties
router.get('/admin/live', authenticateToken, isAdmin, async (req, res) => {
    try {
        const scenarios = await UgcScenario.find({ status: 'approved' })
            .populate('authorId', 'username profilePhoto')
            .sort({ plays: -1 }); // Most played first
        res.json(scenarios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Moderate a scenario (approve/reject)
router.patch('/:id/moderate', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const scenario = await UgcScenario.findById(req.params.id);
        if (!scenario) return res.status(404).json({ message: 'Scenario not found' });

        scenario.status = status;
        scenario.published = (status === 'approved');
        await scenario.save();

        // Send email notification to author
        try {
            const populatedScenario = await UgcScenario.findById(req.params.id).populate('authorId', 'username email');
            if (populatedScenario && populatedScenario.authorId && populatedScenario.authorId.email) {
                const emailHtml = emailTemplates.scenarioStatusUpdate(
                    populatedScenario.authorId.username,
                    populatedScenario.title,
                    status
                );
                await sendEmail(
                    populatedScenario.authorId.email,
                    `[SecuritySim HQ] Scenario Status: ${status.toUpperCase()}`,
                    emailHtml
                );
            }
        } catch (emailError) {
            console.error('Failed to send moderation email:', emailError);
            // Don't fail the moderation if email fails
        }

        res.json({ message: `Scenario ${status} successfully`, scenario });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin toggle scenario bounty
router.patch('/admin/:id/bounty', authenticateToken, isAdmin, async (req, res) => {
    try {
        const scenario = await UgcScenario.findById(req.params.id);
        if (!scenario) return res.status(404).json({ message: 'Scenario not found' });
        
        scenario.isBountied = !scenario.isBountied;
        await scenario.save();
        
        // Log the bounty action if logAction is available (optional but good practice)
        res.json({ message: `Bounty ${scenario.isBountied ? 'placed on' : 'removed from'} scenario`, isBountied: scenario.isBountied });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
