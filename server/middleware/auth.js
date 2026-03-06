import jwt from 'jsonwebtoken';

import User from '../models/User.js';

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

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};
