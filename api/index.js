import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../server/routes/auth.js';
import profileRoutes from '../server/routes/profile.js';
import leaderboardRoutes from '../server/routes/leaderboard.js';
import aiRoutes from '../server/routes/ai.js';
import teamsRoutes from '../server/routes/teams.js';
import challengesRoutes from '../server/routes/challenges.js';

dotenv.config();

const app = express();

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

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/challenges', challengesRoutes);

app.get('/api', (req, res) => {
    res.json({ message: 'SecuritySim API is running' });
});

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 Server is running locally on port ${PORT}`);
    });
}

export default app;
