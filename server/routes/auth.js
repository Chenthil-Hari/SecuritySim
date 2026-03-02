import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

function generateToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, displayName } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }

        const user = new User({
            email: email.toLowerCase(),
            password,
            displayName: displayName || email.split('@')[0],
            provider: 'email'
        });
        await user.save();

        const token = generateToken(user);
        res.status(201).json({ token, user: user.toSafeObject() });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Incorrect email or password.' });
        }

        if (user.provider === 'google' && !user.password) {
            return res.status(401).json({ error: 'This account uses Google login. Please sign in with Google.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect email or password.' });
        }

        const token = generateToken(user);
        res.json({ token, user: user.toSafeObject() });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required.' });
        }

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Find existing user by googleId or email
        let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

        if (user) {
            // Update Google info if needed
            if (!user.googleId) user.googleId = googleId;
            if (!user.photoURL && picture) user.photoURL = picture;
            if (!user.displayName && name) user.displayName = name;
            user.provider = 'google';
            await user.save();
        } else {
            // Create new user
            user = new User({
                email: email.toLowerCase(),
                displayName: name || email.split('@')[0],
                photoURL: picture || null,
                provider: 'google',
                googleId
            });
            await user.save();
        }

        const token = generateToken(user);
        res.json({ token, user: user.toSafeObject() });
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(401).json({ error: 'Google authentication failed. Please try again.' });
    }
});

// GET /api/auth/me — Get current user from token
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json({ user: user.toSafeObject() });
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ error: 'Failed to get user info.' });
    }
});

// PUT /api/auth/profile — Update display name / photo
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { displayName, photoURL } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (displayName !== undefined) user.displayName = displayName;
        if (photoURL !== undefined) user.photoURL = photoURL;
        await user.save();

        res.json({ user: user.toSafeObject() });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Failed to update profile.' });
    }
});

export default router;
