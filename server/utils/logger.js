import AuditLog from '../models/AuditLog.js';

/**
 * Standardized function to log administrative actions.
 * @param {Object} admin - The admin user object (requires id and username).
 * @param {string} action - The action identifier (e.g., 'ban_user').
 * @param {string} details - Human-readable details of the action.
 * @param {string|null} targetId - ID of the object being acted upon (optional).
 * @param {string|null} adminDisplayName - Display name of the admin (optional).
 */
export const logAction = async (admin, action, details, targetId = null, adminDisplayName = null) => {
    try {
        await AuditLog.create({
            adminId: admin.id || admin._id,
            adminName: adminDisplayName || admin.username,
            action,
            details,
            targetId
        });
    } catch (err) {
        console.error("Audit Log Failure:", err);
    }
};
