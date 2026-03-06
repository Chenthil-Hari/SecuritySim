import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getMaintenanceStatus } from '../middleware/auth.js';

const router = express.Router();

router.get('/maintenance-status', getMaintenanceStatus);

// Signup Route
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, country } = req.body;

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email is already taken.' });
        }

        const existingUsername = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
        if (existingUsername) {
            return res.status(400).json({ message: 'Agent Name is already taken.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            country: country || 'Global'
        });
        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id, username: newUser.username, role: newUser.role || 'user' },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                country: newUser.country,
                role: newUser.role || 'user'
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// Check Username Availability
router.get('/check-username', async (req, res) => {
    try {
        const { username } = req.query;
        if (!username || username.length < 3) {
            return res.json({ available: false, message: 'Invalid username' });
        }

        const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
        if (user) {
            return res.json({ available: false, message: 'Name already taken' });
        }

        res.json({ available: true, message: 'Name available' });
    } catch (error) {
        res.status(500).json({ message: 'Error checking username', error: error.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role || 'user' },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                country: user.country,
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Secure Admin Login with single fixed credentials
router.post('/admin-login', async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email?.trim().toLowerCase();
        password = password?.trim();
        
        // Single admin credentials (ensure lowercase comparison)
        const ADMIN_EMAIL = 'admin@hari07.tech';
        const ADMIN_PASS = 'CyberSecurity2026!'; 

        if (email !== ADMIN_EMAIL || password !== ADMIN_PASS) {
            console.log(`[DEBUG] Login attempt failed. Target: ${ADMIN_EMAIL}. Received: ${email}`);
            console.log(`[DEBUG] Pass Lengths - Target: ${ADMIN_PASS.length}, Received: ${password?.length}`);
            return res.status(401).json({ message: 'Invalid administrative credentials' });
        }

        // We create a special JWT for the super admin
        // Use a valid BSON hex string (24 chars) to satisfy Mongoose ObjectId validation
        const SUPER_ADMIN_ID = '000000000000000000000001'; 

        const token = jwt.sign(
            { userId: SUPER_ADMIN_ID, username: 'Headquarters', role: 'admin' },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '2h' } // Short duration for high-security sessions
        );

        res.json({
            token,
            user: {
                id: SUPER_ADMIN_ID,
                username: 'Headquarters',
                email: ADMIN_EMAIL,
                role: 'admin'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Temporary Admin Promotion (Delete in production)
router.post('/make-admin', async (req, res) => {
    try {
        const { email, secret } = req.body;
        if (secret !== 'admin_secret_123') return res.status(403).json({ message: 'Invalid secret' });
        
        const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.json({ message: 'User promoted to admin successfully', user: { username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
