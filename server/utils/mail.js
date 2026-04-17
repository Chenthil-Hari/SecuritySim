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
    timeout: 30000, // 30s timeout for stability
    tls: {
        rejectUnauthorized: false // Helps with serverless cert issues
    },
    debug: true,
    logger: true
});

console.log(`📡 Mail System Initialized: ${process.env.EMAIL_HOST || 'smtp.titan.email'}:${process.env.EMAIL_PORT || 465} (User: ${process.env.EMAIL_USER || 'info@hari07.tech'})`);

/**
 * Send a professional formatted email from info@hari07.tech
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 */
export const sendEmail = async (to, subject, html) => {
    console.log(`📡 Attempting to send email [${subject}] to: ${to}...`);
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
 * Send an email with file attachments (used for certificate PDFs)
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @param {Array<{filename: string, content: Buffer, contentType: string}>} attachments - File attachments
 */
export const sendEmailWithAttachment = async (to, subject, html, attachments = []) => {
    console.log(`📡 Attempting to send email with attachment [${subject}] to: ${to}...`);
    try {
        const mailOptions = {
            from: `"SecuritySim Headquarters" <${process.env.EMAIL_USER || 'info@hari07.tech'}>`,
            to,
            subject,
            html,
            attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email with attachment sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Mail Service Error (attachment):', error);
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
    },
    scenarioStatusUpdate: (username, scenarioTitle, status) => {
        const isApproved = status === 'approved';
        const color = isApproved ? '#00f0ff' : '#ff4757';
        const statusText = isApproved ? 'MISSION APPROVED' : 'MISSION REJECTED';
        const message = isApproved 
            ? `Your investigative case **"${scenarioTitle}"** has been reviewed and cleared for deployment. It is now live in the Interactive Scenarios catalog.`
            : `Your submitted case **"${scenarioTitle}"** was reviewed by HQ and unfortunately did not meet our current field requirements.`;
        
        return `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #30363d; background: #0d1117; color: #e6edf3;">
                <h2 style="color: ${color}; text-align: center;">${statusText}</h2>
                <p>Agent ${username},</p>
                <div style="background: rgba(48, 54, 61, 0.3); border-left: 4px solid ${color}; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0;">${message}</p>
                </div>
                ${isApproved ? '<p>Congratulations on contributing to the collective defense of the platform. Your scenario is already helping other agents level up.</p>' : '<p>We encourage you to refine your scenario based on our beginner-friendly guidelines and submit again.</p>'}
                <hr style="border: 0; border-top: 1px solid #30363d; margin: 20px 0;">
                <p style="font-size: 12px; color: #8b949e; text-align: center;">Sent from HQ Command Center | SecuritySim 2026</p>
            </div>
        `;
    },
    certificateEmail: (username, scenarioTitle) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #30363d; background: #0d1117; color: #e6edf3;">
            <h2 style="color: #00f0ff; text-align: center;">🎓 Mission Certification Issued</h2>
            <p>Congratulations, Agent <strong>${username}</strong>!</p>
            <div style="background: rgba(0, 240, 255, 0.1); border: 1px solid #00f0ff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px; color: #00f0ff;">You have successfully completed</p>
                <p style="margin: 10px 0 0; font-size: 22px; font-weight: 800; color: #ffffff;">${scenarioTitle}</p>
            </div>
            <p>Your Certificate of Completion is attached to this email as a PDF. You can download, print, or share it as proof of your cybersecurity expertise.</p>
            <p style="font-size: 14px; color: #8b949e;">Keep honing your skills — the digital battlefield never sleeps.</p>
            <hr style="border: 0; border-top: 1px solid #30363d; margin: 20px 0;">
            <p style="font-size: 12px; color: #8b949e; text-align: center;">Sent from HQ Command Center | SecuritySim 2026</p>
        </div>
    `,
    achievementEmail: (username, achievementName, detailText) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #30363d; background: #0d1117; color: #e6edf3;">
            <h2 style="color: #00ff88; text-align: center;">🏆 Achievement Unlocked!</h2>
            <p>Agent <strong>${username}</strong>,</p>
            <div style="background: rgba(0, 255, 136, 0.1); border: 1px solid #00ff88; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px; color: #00ff88;">New Milestone Reached</p>
                <p style="margin: 10px 0 0; font-size: 22px; font-weight: 800; color: #ffffff;">${achievementName}</p>
            </div>
            <p>${detailText}</p>
            <p style="font-size: 14px; color: #8b949e;">Head back to HQ to view your updated profile and tackle your next objective.</p>
            <hr style="border: 0; border-top: 1px solid #30363d; margin: 20px 0;">
            <p style="font-size: 12px; color: #8b949e; text-align: center;">Sent from HQ Command Center | SecuritySim 2026</p>
        </div>
    `,
    weeklyDebriefEmail: (username, weeklyXp, weeklyScenarios) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #30363d; background: #0d1117; color: #e6edf3;">
            <h2 style="color: #ffbd2e; text-align: center;">📊 Weekly Agent Debriefing</h2>
            <p>Agent <strong>${username}</strong>,</p>
            <p>Here is your intelligence report for the past 7 days of field operations:</p>
            
            <div style="background: rgba(255, 189, 46, 0.1); border: 1px solid #ffbd2e; border-radius: 8px; padding: 20px; margin: 20px 0; display: flex; justify-content: space-around;">
                <div style="text-align: center;">
                    <div style="font-size: 28px; font-weight: 800; color: #00ff88;">+${weeklyXp}</div>
                    <div style="font-size: 12px; color: #8b949e; text-transform: uppercase; letter-spacing: 1px;">XP Earned</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 28px; font-weight: 800; color: #90caf9;">${weeklyScenarios}</div>
                    <div style="font-size: 12px; color: #8b949e; text-transform: uppercase; letter-spacing: 1px;">Scenarios Thwarted</div>
                </div>
            </div>

            <p style="font-size: 14px; color: #8b949e; text-align: center;">The threat landscape is constantly evolving. Keep your skills sharp for next week's challenges.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background: #30363d; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-weight: 600;">Return to Base</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #30363d; margin: 20px 0;">
            <p style="font-size: 12px; color: #8b949e; text-align: center;">Sent from HQ Command Center | SecuritySim 2026</p>
        </div>
    `,
    adminBroadcastEmail: (subject, messageBody, announcementType) => {
        const typeConfig = {
            xp_boost:    { icon: '⚡', color: '#00ff88', label: 'XP BOOST ACTIVE' },
            new_feature: { icon: '🚀', color: '#00f0ff', label: 'NEW FEATURE' },
            maintenance: { icon: '🔧', color: '#ffbd2e', label: 'MAINTENANCE NOTICE' },
            warning:     { icon: '⚠️', color: '#ff4757', label: 'SECURITY ADVISORY' },
            event:       { icon: '🎯', color: '#a855f7', label: 'SPECIAL EVENT' },
            custom:      { icon: '📢', color: '#90caf9', label: 'HQ ANNOUNCEMENT' }
        };
        const config = typeConfig[announcementType] || typeConfig.custom;
        return `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #30363d; background: #0d1117; color: #e6edf3;">
                <div style="text-align: center; margin-bottom: 12px;">
                    <span style="display: inline-block; background: ${config.color}22; color: ${config.color}; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; border: 1px solid ${config.color}44;">${config.icon} ${config.label}</span>
                </div>
                <h2 style="color: ${config.color}; text-align: center; margin: 8px 0 16px;">${subject}</h2>
                <div style="background: rgba(48, 54, 61, 0.3); border-left: 4px solid ${config.color}; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0; line-height: 1.7;">
                    ${messageBody.replace(/\\n/g, '<br>')}
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background: ${config.color}; color: #0d1117; padding: 10px 24px; border-radius: 4px; text-decoration: none; font-weight: 700; text-transform: uppercase; font-size: 13px;">Open SecuritySim</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #30363d; margin: 20px 0;">
                <p style="font-size: 12px; color: #8b949e; text-align: center;">Sent from HQ Command Center | SecuritySim 2026</p>
            </div>
        `;
    },
    supportReplyEmail: (username, originalMessage, adminReply, adminName) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #30363d; background: #0d1117; color: #e6edf3;">
            <h2 style="color: #00f0ff; text-align: center;">🛡️ HQ Support Response</h2>
            <p>Agent <strong>${username}</strong>,</p>
            <p>Headquarters has reviewed your recent inquiry. Please find the response below:</p>
            
            <div style="background: rgba(0, 240, 255, 0.05); border-left: 3px solid #00f0ff; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 0; font-size: 12px; color: #8b949e; text-transform: uppercase;">Response from ${adminName || 'Admin'}</p>
                <p style="margin: 10px 0 0; line-height: 1.6;">${adminReply.replace(/\n/g, '<br>')}</p>
            </div>

            <div style="margin-top: 30px; padding: 15px; background: #161b22; border: 1px solid #30363d; border-radius: 4px;">
                <p style="margin: 0; font-size: 12px; color: #8b949e;">Your Original Message:</p>
                <p style="margin: 10px 0 0; font-size: 13px; color: #c9d1d9; font-style: italic;">"${originalMessage}"</p>
            </div>

            <hr style="border: 0; border-top: 1px solid #30363d; margin: 20px 0;">
            <p style="font-size: 12px; color: #8b949e; text-align: center;">Sent from HQ Command Center | SecuritySim 2026</p>
        </div>
    `
};
