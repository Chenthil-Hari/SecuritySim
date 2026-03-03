import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'model'],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One continuous chat history per user
    },
    messages: [messageSchema],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the timestamp on save
chatSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
