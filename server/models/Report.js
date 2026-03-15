import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedItemId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'itemModel' },
    itemModel: { type: String, required: true, enum: ['Post', 'Comment'] },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Pending', 'Resolved', 'Dismissed'], default: 'Pending' },
    resolutionNotes: { type: String },
    resolvedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
