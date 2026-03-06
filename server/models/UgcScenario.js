import mongoose from 'mongoose';

const ugcScenarioSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Phishing', 'Scam Calls', 'Malware', 'Social Engineering']
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    description: {
        type: String,
        required: true
    },
    content: {
        mainType: { type: String, required: true }, // e.g., 'email', 'phone', 'file'
        visualData: { type: mongoose.Schema.Types.Mixed, required: true },
        options: [{
            text: String,
            isCorrect: Boolean,
            feedback: String,
            consequence: String
        }],
        educationalExplanation: String
    },
    published: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    plays: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const UgcScenario = mongoose.models.UgcScenario || mongoose.model('UgcScenario', ugcScenarioSchema);
export default UgcScenario;
