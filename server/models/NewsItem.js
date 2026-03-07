import mongoose from 'mongoose';

const newsItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'emergency'],
        default: 'info'
    },
    priority: {
        type: Number,
        default: 0 // Higher is more important
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    expiresAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const NewsItem = mongoose.models.NewsItem || mongoose.model('NewsItem', newsItemSchema);
export default NewsItem;
