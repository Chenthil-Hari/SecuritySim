import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'ahilesh950@gmail.com' });
        if (user) {
            console.log('User found:');
            console.log('Username:', user.username);
            console.log('isVerified:', user.isVerified);
            console.log('verificationOTP:', user.verificationOTP ? 'Set' : 'Not Set');
            console.log('All fields:', JSON.stringify(user.toObject(), null, 2));
        } else {
            console.log('User not found');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
