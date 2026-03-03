import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    // Validate request
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please provide name, email, and a message.' });
    }

    try {
        // Create reusable transporter object using Titan Mail SMTP transport
        // Make sure these are set in Vercel Environment Variables
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.titan.email', // Fallback to Titan SMTP if not provided
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Email setup
        const mailOptions = {
            from: process.env.EMAIL_USER,               // Must match registered Titan email
            to: 'info@hari07.tech',                     // Sending to yourself
            replyTo: email,                             // Replies go to the user who filled the form
            subject: `[SecuritySim Contact] New message from ${name}`,
            text: `You have received a new message from your SecuritySim website.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <h3>New SecuritySim Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <hr/>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br/>')}</p>
            `,
        };

        // Send mail
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);

        return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to send message. Please try again later or contact support directly.'
        });
    }
});

export default router;
