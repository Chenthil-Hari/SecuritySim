import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scenarioId: {
        type: String,
        required: true
    },
    senderAccuracy: {
        type: Number,
        required: true
    },
    senderXp: {
        type: Number,
        required: true
    },
    receiverAccuracy: {
        type: Number,
        default: null
    },
    receiverXp: {
        type: Number,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'declined'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    }
});

const Challenge = mongoose.model('Challenge', challengeSchema);
export default Challenge;
