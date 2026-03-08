import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { getMaintenanceStatus } from '../middleware/auth.js';
import NewsItem from '../models/NewsItem.js';
import SystemSetting from '../models/SystemSetting.js';
import { sendEmail, emailTemplates } from '../utils/mail.js';

const router = express.Router();

router.get('/maintenance-status', getMaintenanceStatus);

// Public System Status (News + Features)
router.get('/system-status', async (req, res) => {
    try {
        const news = await NewsItem.find({ isActive: true }).sort({ priority: -1, createdAt: -1 }).limit(5);
        const featureSetting = await SystemSetting.findOne({ key: 'feature_toggles' });
        const maintenanceSetting = await SystemSetting.findOne({ key: 'maintenance_mode' });
        
        // Robust check for both boolean and object formats
        let isMaintenanceEnabled = false;
        let expectedReturn = null;
        
        if (maintenanceSetting) {
            const val = maintenanceSetting.value;
            if (typeof val === 'boolean') {
                isMaintenanceEnabled = val;
                expectedReturn = maintenanceSetting.updatedAt;
            } else if (typeof val === 'object' && val !== null) {
                isMaintenanceEnabled = !!val.isActive;
                expectedReturn = val.expectedReturn || maintenanceSetting.updatedAt;
            }
        }

        res.json({
            news,
            features: featureSetting ? featureSetting.value : {},
            maintenance: {
                enabled: isMaintenanceEnabled,
                expectedReturn
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            country: country || 'Global',
            verificationOTP: otp,
            verificationOTPExpires: otpExpiry,
            isVerified: false
        });
        await newUser.save();

        // Send OTP Email
        await sendEmail(email, 'SecuritySim Verification Sequence', emailTemplates.otp(otp));

        const token = jwt.sign(
            { userId: newUser._id, username: newUser.username, role: newUser.role || 'user' },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully. Verification required.',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                country: newUser.country,
                role: newUser.role || 'user',
                isFrozen: newUser.isFrozen || false,
                isVerified: false
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

        if (user.isBanned) {
            return res.status(403).json({ 
                message: 'Access Denied: Your account has been permanently suspended.',
                reason: user.banReason || 'Violation of platform Terms of Service.'
            });
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
                role: user.role || 'user',
                isFrozen: user.isFrozen || false,
                isVerified: user.isVerified
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
            { expiresIn: '24h' } // Increased duration for better UX
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

// --- Email Verification Endpoints ---

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

        if (user.verificationOTP !== otp || user.verificationOTPExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP code' });
        }

        user.isVerified = true;
        user.verificationOTP = undefined;
        user.verificationOTPExpires = undefined;
        await user.save();

        res.json({ message: 'Identity verified. Access granted.', isVerified: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationOTP = otp;
        user.verificationOTPExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        await sendEmail(email, 'SecuritySim Verification Sequence (New Code)', emailTemplates.otp(otp));
        res.json({ message: 'New verification code deployed to your inbox' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Password Reset Endpoints ---

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // For security, don't reveal if user exists
            return res.json({ message: 'If an account exists, a recovery link has been sent.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        await sendEmail(email, 'SecuritySim Password Recovery Protocol', emailTemplates.passwordReset(token));
        res.json({ message: 'Recovery link deployed to your inbox' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Recovery link invalid or expired' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Credentials updated. Security protocol restored.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
