import SystemSetting from '../models/SystemSetting.js';

/**
 * Middleware to intercept requests when the system is in maintenance mode.
 * Admins are exempted from this check.
 */
export const maintenanceMiddleware = async (req, res, next) => {
    try {
        // Find the maintenance setting
        const setting = await SystemSetting.findOne({ key: 'maintenance_mode' });
        const isMaintenance = setting ? setting.value === true : false;

        // If maintenance is ON and user is not an admin, block the request
        if (isMaintenance && req.user?.role !== 'admin') {
            return res.status(503).json({ 
                maintenance: true,
                message: "SecuritySim is currently undergoing scheduled maintenance. Please check back later." 
            });
        }

        next();
    } catch (error) {
        console.error("Maintenance check error:", error);
        next(); // Don't block the site if the check itself fails
    }
};
