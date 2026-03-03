import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import leaderboardRoutes from './routes/leaderboard.js';
import contactRoutes from './routes/contact.js';

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
app.use('/api/contact', contactRoutes);

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
