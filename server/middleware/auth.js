import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import SystemSetting from '../models/SystemSetting.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Check for hardcoded Super Admin bypass (Headquarters)
    const SUPER_ADMIN_ID = '000000000000000000000001';
    if (decoded.userId === SUPER_ADMIN_ID) {
      req.user = { id: SUPER_ADMIN_ID, username: 'Headquarters', role: 'admin' };
      return next();
    }

    // Check if user is frozen or role has changed
    const user = await User.findById(decoded.userId).select('isFrozen role username');
    if (!user) {
      return res.status(403).json({ message: 'User account not found.' });
    }

    if (user.isFrozen) {
      return res.status(403).json({ message: 'Your account has been terminal-locked (frozen) by Headquarters.' });
    }

    req.user = { id: decoded.userId, username: decoded.username, role: decoded.role };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please re-authenticate.' });
    }
    res.status(403).json({ message: 'Authentication failure: Invalid signature.' });
  }
};

export const getMaintenanceStatus = async (req, res) => {
  try {
    const maintenance = await SystemSetting.findOne({ key: 'maintenance_mode' });
    res.json({ enabled: maintenance ? maintenance.value : false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

export const maintenanceCheck = async (req, res, next) => {
  // Allow frontend status checks, admin login, and ALL admin API routes to bypass the block
  if (req.path === '/api/auth/maintenance-status' ||
    req.path === '/api/auth/admin-login' ||
    req.path.startsWith('/api/admin')) {
    return next();
  }

  try {
    const maintenance = await SystemSetting.findOne({ key: 'maintenance_mode' });

    if (maintenance && maintenance.value === true) {
      // Check if user is an admin
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
          if (decoded.role === 'admin') {
            return next(); // Admins bypass maintenance
          }
        } catch (err) {
          // Token invalid
        }
      }

      return res.status(503).json({
        message: 'System Under Maintenance',
        details: 'Headquarters is currently undergoing scheduled updates. Please stand by.',
        isMaintenance: true
      });
    }
    next();
  } catch (err) {
    next();
  }
};
