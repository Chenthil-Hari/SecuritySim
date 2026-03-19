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
    pvpWins: {
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
    },
    unlockedTitles: {
        type: [String],
        default: []
    },
    seasonalMedals: [{
        type: { type: String }, // 'gold', 'silver', 'bronze'
        season: String,
        awardedAt: { type: Date, default: Date.now }
    }],
    customization: {
        auraEnabled: { type: Boolean, default: true },
        matrixEnabled: { type: Boolean, default: false },
        activeBanner: { type: String, default: 'default' }
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequests: [{
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending'],
            default: 'pending'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isFrozen: {
        type: Boolean,
        default: false
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    banReason: {
        type: String,
        default: ''
    },
    enforcementHistory: [{
        action: String, // 'ban' or 'unban'
        reason: String,
        adminName: String,
        timestamp: { type: Date, default: Date.now }
    }],
    lastSeen: {
        type: Date,
        default: Date.now
    },
    // Password Reset & Email Verification
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationOTP: String,
    verificationOTPExpires: Date,
    showInLeaderboard: {
        type: Boolean,
        default: true
    }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
