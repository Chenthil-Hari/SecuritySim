import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Middleware to verify user token before allowing AI access
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Authentication required to use AI Assistant' });

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// INITIALIZE GEMINI SDK
// We initialize it lazily inside the route so it doesn't crash the server if the key is initially missing
const getAIModel = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-2.5-flash for fastest conversational responses
    return genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: "You are an elite, highly knowledgeable cybersecurity specialist named 'Cipher' assisting a user on the interactive SecuritySim platform. The user is learning about cyber threats, phishing, social engineering, encryption, and safe digital practices. Keep your responses concise, professional, encouraging, and directly relevant to cybersecurity or the concepts they are learning. Do not answer questions outside the scope of cybersecurity, technology, or the SecuritySim platform. Format your responses using clean markdown (bolding, lists, code blocks) to make them highly readable."
    });
};


/**
 * POST: Send a message to the AI
 * Expects { text: "new message", history: [{ role: 'user' | 'model', text: "..." }] }
 */
router.post('/message', authenticateToken, async (req, res) => {
    try {
        const { text, history = [] } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Message text cannot be empty.' });
        }

        // Format history for Gemini SDK
        // Gemini expects history in format: { role: 'user' | 'model', parts: [{ text: "..." }] }
        // We only pass the last 20 messages to save tokens and prevent huge payload errors
        const formattedHistory = history.slice(-20).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // Initialize Gemini Chat Session
        const model = getAIModel();
        const chatSession = model.startChat({
            history: formattedHistory,
            // Configure generation parameters for safer, conciser answers
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            },
        });

        // Send message and await AI response
        const result = await chatSession.sendMessage(text);
        const aiResponseText = result.response.text();

        // Return the new message to the frontend UI
        res.json({ message: { role: 'model', text: aiResponseText, _id: Date.now().toString() } });

    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({
            message: 'Failed to process AI response. The service might be temporarily unavailable.',
            error: error.message
        });
    }
});



export default router;
