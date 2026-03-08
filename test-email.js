import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.titan.email',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
        user: process.env.EMAIL_USER || 'info@hari07.tech',
        pass: process.env.EMAIL_PASS
    }
});

async function test() {
    console.log('--- SMTP Diagnostic Test ---');
    console.log('Host:', process.env.EMAIL_HOST || 'smtp.titan.email');
    console.log('Port:', process.env.EMAIL_PORT || 587);
    console.log('User:', process.env.EMAIL_USER || 'info@hari07.tech');
    
    try {
        await transporter.verify();
        console.log('✅ SMTP Connection Verified');
        
        const info = await transporter.sendMail({
            from: '"SecuritySim Test" <info@hari07.tech>',
            to: 'chenthilhari@gmail.com',
            subject: 'SMTP Diagnostic Check',
            text: 'If you see this, the mail system is functional.'
        });
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (err) {
        console.error('❌ SMTP Diagnostic Failed:');
        console.error(err);
    }
}

test();
