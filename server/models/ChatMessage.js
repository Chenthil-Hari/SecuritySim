import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
    warRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WarRoom',
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderName: String,
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;
