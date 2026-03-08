import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';

dotenv.config();

async function listAdmins() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const admins = await User.find({ role: /admin/i });
        console.log('--- Current Admins ---');
        admins.forEach(a => {
            console.log(`Username: ${a.username}`);
            console.log(`Email: ${a.email}`);
            console.log(`Role: ${a.role}`);
            console.log(`isVerified: ${a.isVerified}`);
            console.log('----------------------');
        });

        const specificUser = await User.findOne({ email: 'chenthilhari@gmail.com' });
        if (specificUser) {
            console.log('\n--- Specific User Check (chenthilhari@gmail.com) ---');
            console.log(`Role: ${specificUser.role}`);
            console.log(`isVerified: ${specificUser.isVerified}`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

listAdmins();
