import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        default: 'Anonymous'
    },
    photoURL: {
        type: String,
        default: null
    },
    score: {
        type: Number,
        default: 50
    },
    level: {
        type: Number,
        default: 1
    },
    xp: {
        type: Number,
        default: 0
    },
    scenariosCompleted: {
        type: Number,
        default: 0
    },
    badgesCount: {
        type: Number,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Leaderboard', leaderboardSchema);
