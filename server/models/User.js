import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        // Not required for Google OAuth users
        default: null
    },
    displayName: {
        type: String,
        default: ''
    },
    photoURL: {
        type: String,
        default: null
    },
    provider: {
        type: String,
        enum: ['email', 'google'],
        default: 'email'
    },
    googleId: {
        type: String,
        default: null
    },
    gameState: {
        score: { type: Number, default: 50 },
        xp: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        badges: { type: [String], default: [] },
        completedScenarios: { type: Array, default: [] },
        difficulty: { type: Number, default: 1 }
    },
    settings: {
        highContrast: { type: Boolean, default: false },
        voiceGuidance: { type: Boolean, default: false }
    }
}, {
    timestamps: true // adds createdAt and updatedAt
});

// Hash password before save (only if modified and exists)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

// Return safe user object (no password)
userSchema.methods.toSafeObject = function () {
    return {
        _id: this._id,
        email: this.email,
        displayName: this.displayName,
        photoURL: this.photoURL,
        provider: this.provider,
        gameState: this.gameState,
        settings: this.settings,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

export default mongoose.model('User', userSchema);
