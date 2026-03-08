import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';

dotenv.config();

async function promote() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const result = await User.updateOne(
            { email: 'chenthilhari@gmail.com' },
            { $set: { role: 'admin', isVerified: true } }
        );
        console.log('Update result:', result);
        
        const user = await User.findOne({ email: 'chenthilhari@gmail.com' });
        console.log('Updated User Status:', {
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

promote();
