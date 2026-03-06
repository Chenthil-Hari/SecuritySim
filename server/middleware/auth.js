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
    
    // Check if user is frozen
    const user = await User.findById(decoded.userId).select('isFrozen role username');
    if (user && user.isFrozen) {
      return res.status(403).json({ message: 'Your account has been terminal-locked (frozen) by Headquarters.' });
    }

    req.user = { id: decoded.userId, username: decoded.username, role: decoded.role };
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token.' });
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
