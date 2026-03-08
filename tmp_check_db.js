import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SystemSetting from './server/models/SystemSetting.js';

dotenv.config();

async function checkSettings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const featureToggles = await SystemSetting.findOne({ key: 'feature_toggles' });
        console.log('Feature Toggles:', JSON.stringify(featureToggles ? featureToggles.value : 'Not found', null, 2));
        
        const maintenanceMode = await SystemSetting.findOne({ key: 'maintenance_mode' });
        console.log('Maintenance Mode:', JSON.stringify(maintenanceMode ? maintenanceMode.value : 'Not found', null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkSettings();
