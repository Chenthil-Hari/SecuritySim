import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'chenthilhari@gmail.com' });
        if (user) {
            console.log('Admin User found:');
            console.log('Username:', user.username);
            console.log('isVerified:', user.isVerified);
            console.log('Role:', user.role);
            
            if (user.isVerified !== true) {
                user.isVerified = true;
                await user.save();
                console.log('✅ Admin user has been FORCE VERIFIED via terminal.');
            }
        } else {
            console.log('Admin user not found');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
