import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    adminId: {
        type: String, // Can be ObjectId or 'SUPER_ADMIN_ID' (000000000000000000000001)
        required: true
    },
    adminName: {
        type: String,
        required: true
    },
    action: {
        type: String, // e.g., 'approve_scenario', 'freeze_user', 'reset_password', 'toggle_maintenance'
        required: true
    },
    targetId: {
        type: String, // ID of the scenario or user acted upon
        default: null
    },
    details: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
