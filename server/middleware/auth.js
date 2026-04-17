import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import SystemSetting from '../models/SystemSetting.js';
import { requireAuth } from '@clerk/express';

// Export Clerk's middleware as our base authentication checker
export const authenticateToken = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth.userId;
      if (!clerkId) {
        return res.status(401).json({ message: 'Access denied. No valid Clerk session.' });
      }

      // Check if user is frozen
      const user = await User.findOne({ clerkId }).select('isFrozen role username _id');
      if (!user) {
        // Allow pass-through if they are just hitting the /sync route
        if (req.path === '/api/auth/sync') return next();
        return res.status(403).json({ message: 'User account not found in database.' });
      }

      if (user.isFrozen) {
        return res.status(403).json({ message: 'Your account has been terminal-locked (frozen) by Headquarters.' });
      }

      // Inject standard custom data into req.user
      req.user = { id: user._id, username: user.username, role: user.role, clerkId };
      next();
    } catch (error) {
      res.status(500).json({ message: 'Authentication failure checking database.' });
    }
  }
];

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
    res.status(403).json({
      message: 'Access denied. Admin privileges required.',
      debug: req.user ? { id: req.user.id, role: req.user.role } : 'No user in request'
    });
  }
};

export const maintenanceCheck = async (req, res, next) => {
  // Allow frontend status checks, admin login, and ALL admin API routes to bypass the block
  if (req.path === '/api/auth/maintenance-status' ||
    req.path === '/api/auth/admin-login' ||
    req.path === '/api/auth/sync' ||
    req.path.startsWith('/api/admin')) {
    return next();
  }

  try {
    const maintenance = await SystemSetting.findOne({ key: 'maintenance_mode' });

    if (maintenance && maintenance.value === true) {
      if (req.user && req.user.role === 'admin') {
        return next();
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
