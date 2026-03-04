import express from 'express';
import jwt from 'jsonwebtoken';
import Team from '../models/Team.js';
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

// Generate a random 6-character alphanumeric invite code
const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// POST /api/teams/create
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;

        // Ensure user isn't already in a team
        const user = await User.findById(req.userId);
        if (user.teamId) {
            return res.status(400).json({ message: 'You are already in a team. Leave it first to create a new one.' });
        }

        const existingTeam = await Team.findOne({ name });
        if (existingTeam) {
            return res.status(400).json({ message: 'Team name is already taken.' });
        }

        const newTeam = new Team({
            name,
            inviteCode: generateInviteCode(),
            ownerId: user._id,
            members: [user._id]
        });

        await newTeam.save();

        user.teamId = newTeam._id;
        await user.save();

        res.status(201).json({ message: 'Team created successfully', team: newTeam });
    } catch (error) {
        res.status(500).json({ message: 'Error creating team', error: error.message });
    }
});

// POST /api/teams/join
router.post('/join', authMiddleware, async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const code = inviteCode?.trim().toUpperCase();

        const user = await User.findById(req.userId);
        if (user.teamId) {
            return res.status(400).json({ message: 'You are already in a team.' });
        }

        const team = await Team.findOne({ inviteCode: code });
        if (!team) {
            return res.status(404).json({ message: 'Invalid invite code. Team not found.' });
        }

        if (team.members.length >= 10) {
            return res.status(400).json({ message: 'This team is full (Max 10 players).' });
        }

        team.members.push(user._id);
        await team.save();

        user.teamId = team._id;
        await user.save();

        res.json({ message: 'Successfully joined team', team });
    } catch (error) {
        res.status(500).json({ message: 'Error joining team', error: error.message });
    }
});

// GET /api/teams/my-team
router.get('/my-team', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user.teamId) {
            return res.status(404).json({ message: 'You are not in a team.' });
        }

        // Fetch team and populate members with only necessary fields
        const team = await Team.findById(user.teamId).populate('members', 'username score level profilePhoto country');

        // Calculate dynamic team score based on members' scores
        const totalScore = team.members.reduce((sum, member) => sum + member.score, 0);

        // Update DB score if it drifted
        if (team.totalScore !== totalScore) {
            team.totalScore = totalScore;
            await team.save();
        }

        res.json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching team data', error: error.message });
    }
});

// POST /api/teams/leave
router.post('/leave', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user.teamId) {
            return res.status(400).json({ message: 'You are not in a team.' });
        }

        const team = await Team.findById(user.teamId);

        // Remove user from members array
        team.members = team.members.filter(id => id.toString() !== user._id.toString());

        if (team.members.length === 0) {
            // If team is empty, delete it
            await Team.findByIdAndDelete(team._id);
        } else if (team.ownerId.toString() === user._id.toString()) {
            // If owner left, reassign ownership to the first remaining member
            team.ownerId = team.members[0];
            await team.save();
        } else {
            await team.save();
        }

        user.teamId = null;
        await user.save();

        res.json({ message: 'Left team successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error leaving team', error: error.message });
    }
});

// GET /api/teams/leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        // Find top 100 teams by total score
        const teams = await Team.find()
            .sort({ totalScore: -1 })
            .limit(100)
            .select('name totalScore members createdAt')
            .populate('members', 'username level'); // just minimal data for members

        // Calculate actual scores to ensure leaderboard is accurate at query time
        const hydratedTeams = teams.map(team => {
            const actualScore = team.members.reduce((sum, member) => sum + (member.score || 0), 0);
            return {
                id: team._id,
                name: team.name,
                totalScore: actualScore,
                memberCount: team.members.length,
                createdAt: team.createdAt
            };
        }).sort((a, b) => b.totalScore - a.totalScore); // Rely on calculated score

        res.json(hydratedTeams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching team leaderboard', error: error.message });
    }
});

export default router;
