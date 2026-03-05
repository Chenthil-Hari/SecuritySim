import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    country: {
        type: String,
        default: 'Global',
        trim: true
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    score: {
        type: Number,
        default: 50
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    badges: {
        type: [String],
        default: []
    },
    completedScenarios: [{
        scenarioId: String,
        category: String,
        accuracy: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Advanced Feature Properties
    skillPoints: {
        type: Number,
        default: 0
    },
    unlockedSkills: {
        type: [String],
        default: []
    },
    weeklyCompleted: {
        type: [String],
        default: []
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    }
});

const User = mongoose.model('User', userSchema);
export default User;
