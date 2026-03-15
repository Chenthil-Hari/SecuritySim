import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from '../server/routes/auth.js';
import profileRoutes from '../server/routes/profile.js';
import leaderboardRoutes from '../server/routes/leaderboard.js';
import aiRoutes from '../server/routes/ai.js';
import teamsRoutes from '../server/routes/teams.js';
import challengesRoutes from '../server/routes/challenges.js';
import threatsRoutes from '../server/routes/threats.js';
import friendsRoutes from '../server/routes/friends.js';
import ugcScenariosRoutes from '../server/routes/ugcScenarios.js';
import warroomsRoutes from '../server/routes/warrooms.js';
import usersRoutes from '../server/routes/users.js';
import adminRoutes from '../server/routes/admin.js';
import pvpRoutes from '../server/routes/pvp.js';
import eventsRoutes from '../server/routes/events.js';
import feedRoutes from '../server/routes/feed.js';
import moderationRoutes from '../server/routes/moderation.js';
import { maintenanceMiddleware } from '../server/middleware/maintenance.js';
import SystemSetting from '../server/models/SystemSetting.js';
import { authenticateToken } from '../server/middleware/auth.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Map to track userId -> socket.id
const userSockets = new Map();
app.set('userSockets', userSockets);

// Make io accessible to routes
app.set('io', io);

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;

let cachedConnection = null;

async function connectToDatabase() {
    if (cachedConnection) {
        return cachedConnection;
    }

    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI environment variable is not defined!");
    }

    // Set connection options for stability
    const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
    };

    try {
        cachedConnection = await mongoose.connect(MONGODB_URI, opts);
        console.log('✅ Connected to MongoDB successfully!');
        return cachedConnection;
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        throw err;
    }
}

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (err) {
        res.status(500).json({ 
            message: 'Database connection failed', 
            error: err.message,
            tip: 'Check your Vercel environment variables and MongoDB Atlas IP whitelist.' 
        });
    }
});

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Check maintenance for sockets if needed, but primarily we'll handle at the route level

    socket.on('join_warroom', async ({ roomId, userId }) => {
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);
        
        // Add user to active participants in DB if not already there
        const WarRoom = (await import('../server/models/WarRoom.js')).default;
        const warRoom = await WarRoom.findById(roomId).populate('activeParticipants', 'username profilePhoto');
        if (warRoom && !warRoom.activeParticipants.some(p => p._id.toString() === userId)) {
            warRoom.activeParticipants.push(userId);
            await warRoom.save();
            const updatedWarRoom = await WarRoom.findById(roomId).populate('activeParticipants', 'username profilePhoto');
            io.to(roomId).emit('participants_updated', updatedWarRoom.activeParticipants);
        } else if (warRoom) {
            io.to(roomId).emit('participants_updated', warRoom.activeParticipants);
        }
    });

    socket.on('send_message', async (data) => {
        // data: { roomId, senderId, senderName, text }
        try {
            const ChatMessage = (await import('../server/models/ChatMessage.js')).default;
            const newMessage = new ChatMessage({
                warRoomId: data.roomId,
                senderId: data.senderId,
                senderName: data.senderName,
                text: data.text
            });
            await newMessage.save();
            io.to(data.roomId).emit('receive_message', newMessage);
        } catch (err) {
            console.error("Error saving chat message:", err);
            // Fallback: emit without saving if DB fails
            io.to(data.roomId).emit('receive_message', { ...data, timestamp: new Date() });
        }
    });

    socket.on('leave_warroom', async ({ roomId, userId }) => {
        socket.leave(roomId);
        const WarRoom = (await import('../server/models/WarRoom.js')).default;
        const warRoom = await WarRoom.findById(roomId);
        if (warRoom) {
            warRoom.activeParticipants = warRoom.activeParticipants.filter(p => p.toString() !== userId);
            await warRoom.save();
            const updatedWarRoom = await WarRoom.findById(roomId).populate('activeParticipants', 'username profilePhoto');
            io.to(roomId).emit('participants_updated', updatedWarRoom.activeParticipants);
        }
    });

    socket.on('update_evidence', (data) => {
        // data: { roomId, evidence }
        io.to(data.roomId).emit('evidence_updated', data.evidence);
    });

    socket.on('advance_scenario', (data) => {
        // data: { roomId, nextNodeId, historyItem }
        io.to(data.roomId).emit('scenario_advanced', data);
    });

    socket.on('identify', (userId) => {
        if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);
        console.log(`User ${userId} added socket ${socket.id}. Total sockets: ${userSockets.get(userId).size}`);
    });

    socket.on('disconnect', () => {
        for (const [userId, sockets] of userSockets.entries()) {
            if (sockets.has(socket.id)) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    userSockets.delete(userId);
                }
                break;
            }
        }
        console.log('User disconnected:', socket.id);
    });

    // PvP Duel Handlers
    socket.on('join_duel', (matchId) => {
        socket.join(matchId);
        console.log(`User ${socket.id} joined duel ${matchId}`);
    });

    socket.on('duel_score_update', (data) => {
        // data: { matchId, userId, score, currentNodeId }
        socket.to(data.matchId).emit('opponent_score_update', data);
    });

    socket.on('duel_finish', (data) => {
        // data: { matchId, userId, finalScore }
        socket.to(data.matchId).emit('opponent_finished', data);
    });

    // Private Invitations
    socket.on('send_duel_invite', (data) => {
        // data: { fromId, fromName, toId, matchId, scenarioId }
        const targetSockets = userSockets.get(data.toId);
        if (targetSockets && targetSockets.size > 0) {
            targetSockets.forEach(socketId => {
                io.to(socketId).emit('incoming_duel_invite', data);
            });
        } else {
            // Target is offline
            socket.emit('invite_response', { accepted: false, message: 'Opponent is offline.' });
        }
    });

    socket.on('respond_to_invite', (data) => {
        // data: { fromId, toId, matchId, accepted }
        const targetSockets = userSockets.get(data.toId);
        if (targetSockets && targetSockets.size > 0) {
            targetSockets.forEach(socketId => {
                io.to(socketId).emit('invite_response', data);
            });
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/threats', threatsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/ugc-scenarios', ugcScenariosRoutes);
app.use('/api/warrooms', warroomsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/moderation', moderationRoutes);

// Maintenance Status (Public)
app.get('/api/maintenance/status', async (req, res) => {
    try {
        const setting = await SystemSetting.findOne({ key: 'maintenance_mode' });
        if (!setting) return res.json({ maintenance: false, expectedReturn: '' });

        const maintenance = typeof setting.value === 'boolean' ? setting.value : setting.value.isActive;
        const expectedReturn = typeof setting.value === 'object' ? setting.value.expectedReturn : '';

        res.json({ maintenance, expectedReturn });
    } catch (err) {
        res.json({ maintenance: false, expectedReturn: '' });
    }
});

// Apply Maintenance Middleware to specific User/Public routes
app.use('/api/profile', authenticateToken, maintenanceMiddleware);
app.use('/api/leaderboard', maintenanceMiddleware);
app.use('/api/ai', authenticateToken, maintenanceMiddleware);
app.use('/api/teams', authenticateToken, maintenanceMiddleware);
app.use('/api/challenges', maintenanceMiddleware);
app.use('/api/threats', maintenanceMiddleware);
app.use('/api/friends', authenticateToken, maintenanceMiddleware);
app.use('/api/ugc-scenarios', maintenanceMiddleware);
app.use('/api/warrooms', authenticateToken, maintenanceMiddleware);
app.use('/api/users', maintenanceMiddleware);
app.use('/api/pvp', authenticateToken, maintenanceMiddleware);
app.use('/api/events', maintenanceMiddleware);
app.use('/api/feed', authenticateToken, maintenanceMiddleware);

// Debug endpoint for sockets
app.get('/api/debug/sockets', (req, res) => {
    const debugData = {};
    for (const [userId, sockets] of userSockets.entries()) {
        debugData[userId] = Array.from(sockets);
    }
    res.json({
        totalUsers: userSockets.size,
        users: debugData
    });
});

app.use('/api/pvp', pvpRoutes);
app.use('/api/events', eventsRoutes);

app.get('/api', (req, res) => {
    res.json({ 
        message: 'SecuritySim API is running',
        env: process.env.NODE_ENV,
        dbState: mongoose.connection.readyState 
    });
});

app.get('/api/health', async (req, res) => {
    const health = {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: Date.now(),
        mongodb: {
            connected: mongoose.connection.readyState === 1,
            state: mongoose.connection.readyState,
            hasUri: !!process.env.MONGODB_URI
        }
    };
    
    try {
        if (mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }
        res.json(health);
    } catch (err) {
        health.status = 'error';
        health.error = err.message;
        res.status(500).json(health);
    }
});

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server is running locally on port ${PORT}`);
    });
}

export default app;
