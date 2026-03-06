import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    scores: {
        type: Map,
        of: Number,
        default: {}
    },
    currentNodes: {
        type: Map,
        of: String,
        default: {}
    },
    scenarioId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['searching', 'playing', 'completed'],
        default: 'searching'
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date
});

const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);
export default Match;
