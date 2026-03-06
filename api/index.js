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

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("CRITICAL: MONGODB_URI environment variable is not defined!");
} else {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('✅ Connected to MongoDB successfully!'))
        .catch(err => console.error('❌ MongoDB connection error:', err.message));
}

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

app.get('/api', (req, res) => {
    res.json({ message: 'SecuritySim API is running' });
});

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server is running locally on port ${PORT}`);
    });
}

export default app;
