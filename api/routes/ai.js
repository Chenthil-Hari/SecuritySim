import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';
import Chat from '../models/Chat.js';
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
 * GET: Fetch the user's current chat history
 */
router.get('/history', authenticateToken, async (req, res) => {
    try {
        let chat = await Chat.findOne({ userId: req.user.userId });

        // If they don't have a chat history yet, create an empty one
        if (!chat) {
            chat = new Chat({ userId: req.user.userId, messages: [] });
            await chat.save();
        }

        res.json({ messages: chat.messages });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Failed to retrieve chat history.' });
    }
});


/**
 * POST: Send a message to the AI
 */
router.post('/message', authenticateToken, async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.user.userId;

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Message text cannot be empty.' });
        }

        // 1. Get or Create User's Chat Document
        let chat = await Chat.findOne({ userId });
        if (!chat) {
            chat = new Chat({ userId, messages: [] });
        }

        // 2. Append User Message to DB immediately
        const userMessage = { role: 'user', text: text };
        chat.messages.push(userMessage);

        // Save user message in case AI crashes, we don't drop their text
        await chat.save();

        // 3. Format history for Gemini SDK
        // Gemini expects history in format: { role: 'user' | 'model', parts: [{ text: "..." }] }
        // We only pass the last 20 messages to save tokens and prevent huge payload errors
        const recentHistory = chat.messages.slice(-20);

        // Exclude the absolute last message (the one they just sent) from the history context
        // because we feed that as the "new" message prompt natively
        const formattedHistory = recentHistory.slice(0, -1).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // 4. Initialize Gemini Chat Session
        const model = getAIModel();
        const chatSession = model.startChat({
            history: formattedHistory,
            // Configure generation parameters for safer, conciser answers
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7, // Slight creativity, mostly deterministic
            },
        });

        // 5. Send message and await AI response
        const result = await chatSession.sendMessage(text);
        const aiResponseText = result.response.text();

        // 6. Append AI Response to DB
        const aiMessage = { role: 'model', text: aiResponseText };
        chat.messages.push(aiMessage);
        await chat.save();

        // 7. Return the new message to the frontend UI
        res.json({ message: aiMessage });

    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({
            message: 'Failed to process AI response. The service might be temporarily unavailable.',
            error: error.message
        });
    }
});

/**
 * DELETE: Clear chat history
 */
router.delete('/clear', authenticateToken, async (req, res) => {
    try {
        await Chat.findOneAndDelete({ userId: req.user.userId });
        res.json({ message: 'Chat history cleared successfully.' });
    } catch (error) {
        console.error('Error clearing chat:', error);
        res.status(500).json({ message: 'Failed to clear chat history.' });
    }
});

export default router;
