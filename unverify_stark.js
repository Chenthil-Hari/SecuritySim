import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';

dotenv.config();

async function unverify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const result = await User.updateOne(
            { email: 'ahilesh950@gmail.com' },
            { $set: { isVerified: false } }
        );
        console.log('Update result:', result);
        
        // Also let's check for any other users who might be incorrectly verified
        const users = await User.find({ isVerified: true });
        console.log(`Currently ${users.length} verified users.`);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

unverify();
