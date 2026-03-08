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
            members: [user._id],
            memberRoles: [{ userId: user._id, role: 'Principal Investigator' }] // Owner starts as Principal Investigator
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
        
        // Assign default role for new member
        team.memberRoles.push({ userId: user._id, role: 'Technical Operative' });
        
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

        // Standardize roles: Ensure all members have a role entry
        let roleUpdated = false;
        team.members.forEach(member => {
            const hasRole = team.memberRoles.find(r => r.userId.toString() === member._id.toString());
            if (!hasRole) {
                team.memberRoles.push({ 
                    userId: member._id, 
                    role: member._id.toString() === team.ownerId.toString() ? 'Principal Investigator' : 'Technical Operative' 
                });
                roleUpdated = true;
            }
        });

        if (roleUpdated) await team.save();

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
        if (!team) {
            user.teamId = null;
            await user.save();
            return res.json({ message: 'Left team successfully (Note: Team data was missing)' });
        }

        // Remove user from members array
        team.members = team.members.filter(id => id && id.toString() !== user._id.toString());

        if (team.members.length === 0) {
            // If team is empty, delete it
            await Team.findByIdAndDelete(team._id);
        } else if (team.ownerId && team.ownerId.toString() === user._id.toString()) {
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

// POST /api/teams/promote
router.post('/promote', authMiddleware, async (req, res) => {
    try {
        const { targetUserId, newRole } = req.body;
        const validRoles = ['Principal Investigator', 'Security Researcher', 'Threat Analyst', 'Technical Operative'];

        if (!validRoles.includes(newRole)) {
            return res.status(400).json({ message: 'Invalid role selection.' });
        }

        const team = await Team.findOne({ ownerId: req.userId });
        if (!team) {
            return res.status(403).json({ message: 'Only the team owner can promote members.' });
        }

        // Find the member's role entry
        const roleEntry = team.memberRoles.find(r => r.userId.toString() === targetUserId.toString());
        if (roleEntry) {
            roleEntry.role = newRole;
        } else {
            team.memberRoles.push({ userId: targetUserId, role: newRole });
        }

        await team.save();
        res.json({ message: `Successfully promoted member to ${newRole}`, team });
    } catch (error) {
        res.status(500).json({ message: 'Error promoting member', error: error.message });
    }
});

// GET /api/teams/leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        // Find top 100 teams by total score
        const teams = await Team.find()
            .sort({ totalScore: -1 })
            .limit(100)
            .populate('members', 'username level score profilePhoto');

        const hydratedTeams = teams.map((team, index) => ({
            rank: index + 1,
            id: team._id,
            name: team.name,
            totalScore: team.totalScore,
            memberCount: team.members.length,
            members: team.members.slice(0, 3).map(m => ({
                username: m.username,
                profilePhoto: m.profilePhoto
            })),
            createdAt: team.createdAt
        }));

        res.json(hydratedTeams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching team leaderboard', error: error.message });
    }
});

export default router;
