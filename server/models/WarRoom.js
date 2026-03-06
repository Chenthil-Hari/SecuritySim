import mongoose from 'mongoose';

const warRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    scenarioId: {
        type: String, // Can be built-in ID or UgcScenario ObjectId
        required: true
    },
    scenarioType: {
        type: String,
        enum: ['core', 'ugc'],
        default: 'core'
    },
    activeParticipants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    evidenceBoard: {
        items: [{
            id: String,
            type: String,
            label: String,
            x: Number,
            y: Number,
            revealedBy: String // username
        }]
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date
});

const WarRoom = mongoose.models.WarRoom || mongoose.model('WarRoom', warRoomSchema);
export default WarRoom;
