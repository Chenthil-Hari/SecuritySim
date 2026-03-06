import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['XP_BOOST', 'CHALLENGE_WEEKEND', 'ZERO_DAY_FRIDAY', 'SYSTEM_MAINTENANCE'],
        required: true
    },
    multiplier: {
        type: Number,
        default: 1.0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default Event;
