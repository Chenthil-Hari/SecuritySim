import nodemailer from 'nodemailer';

/**
 * Titan Mail SMTP Configuration
 * These values should ideally be managed via Vercel Environment Variables
 */
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.titan.email',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: parseInt(process.env.EMAIL_PORT) === 465, // Use SSL/TLS for 465, otherwise STARTTLS
    auth: {
        user: process.env.EMAIL_USER || 'info@hari07.tech',
        pass: process.env.EMAIL_PASS
    },
    // For Vercel/Serverless, we typically want to disable pooling to ensure
    // connections are cleared after the function execution
    pool: false,
    timeout: 10000 // 10s timeout
});

console.log(`📡 Mail System Initialized: ${process.env.EMAIL_HOST || 'smtp.titan.email'}:${process.env.EMAIL_PORT || 465} (User: ${process.env.EMAIL_USER || 'info@hari07.tech'})`);

/**
 * Send a professional formatted email from info@hari07.tech
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 */
export const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"SecuritySim Headquarters" <${process.env.EMAIL_USER || 'info@hari07.tech'}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Mail Service Error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Templates for consistent branding
 */
export const emailTemplates = {
    otp: (otp) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #30363d; background: #0d1117; color: #e6edf3;">
            <h2 style="color: #00f0ff; text-align: center;">Verification Sequence Initiated</h2>
            <p>Agent, your identity must be verified before granting platform clearance.</p>
            <div style="background: rgba(0, 240, 255, 0.1); border: 1px solid #00f0ff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #00f0ff;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #8b949e;">This code expires in 15 minutes. If you did not initiate this request, contact HQ immediately.</p>
            <hr style="border: 0; border-top: 1px solid #30363d; margin: 20px 0;">
            <p style="font-size: 12px; color: #8b949e; text-align: center;">Sent from HQ Command Center | SecuritySim 2026</p>
        </div>
    `,
    passwordReset: (token) => {
        // We'll need the actual platform URL for the reset link
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
        return `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #30363d; background: #0d1117; color: #e6edf3;">
                <h2 style="color: #ff4757; text-align: center;">Password Recovery Protocol</h2>
                <p>We received a request to override the credentials for your agent profile.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background: #ff4757; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 800; text-transform: uppercase;">Reset Password</a>
                </div>
                <p style="font-size: 14px; color: #8b949e;">This link will expire in 1 hour. If you did not request this, your account may be under reconnaissance—change your password immediately.</p>
                <hr style="border: 0; border-top: 1px solid #30363d; margin: 20px 0;">
                <p style="font-size: 12px; color: #8b949e; text-align: center;">Sent from HQ Command Center | SecuritySim 2026</p>
            </div>
        `;
    }
};
