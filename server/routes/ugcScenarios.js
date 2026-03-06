import express from 'express';
import UgcScenario from '../models/UgcScenario.js';
import { authenticateToken } from '../middleware/auth.js';

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
            published: true // Auto-publish for now
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
        const scenarios = await UgcScenario.find({ published: true })
            .populate('authorId', 'username profilePhoto')
            .sort({ createdAt: -1 });
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

export default router;
