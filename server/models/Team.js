import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    inviteCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    memberRoles: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { 
            type: String, 
            enum: ['Principal Investigator', 'Security Researcher', 'Threat Analyst', 'Technical Operative'],
            default: 'Technical Operative'
        }
    }],
    totalScore: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Team = mongoose.model('Team', teamSchema);
export default Team;
