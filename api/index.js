import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { maintenanceCheck } from '../server/middleware/auth.js';

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

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

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

// Maintenance check (Global)
app.use(maintenanceCheck);

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_warroom', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('send_message', (data) => {
        // data: { roomId, senderId, senderName, text }
        io.to(data.roomId).emit('receive_message', data);
    });

    socket.on('update_evidence', (data) => {
        // data: { roomId, evidence }
        socket.to(data.roomId).emit('evidence_updated', data.evidence);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
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
