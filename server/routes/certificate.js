import express from 'express';
import jwt from 'jsonwebtoken';
import { jsPDF } from 'jspdf';
import User from '../models/User.js';
import { sendEmailWithAttachment, emailTemplates } from '../utils/mail.js';

const router = express.Router();

// Auth middleware
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

/**
 * POST /api/certificate/send
 * Generate a certificate PDF server-side and email it to the user
 */
router.post('/send', authMiddleware, async (req, res) => {
    try {
        const { scenarioTitle } = req.body;
        if (!scenarioTitle) {
            return res.status(400).json({ message: 'scenarioTitle is required' });
        }

        const user = await User.findById(req.userId).select('username email');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const completionDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Generate the PDF using jsPDF drawing API
        const pdfBuffer = generateCertificatePDF(user.username, scenarioTitle, completionDate);

        // Send email with the PDF attachment
        const emailHtml = emailTemplates.certificateEmail(user.username, scenarioTitle);
        const result = await sendEmailWithAttachment(
            user.email,
            `🎓 Certificate of Completion — ${scenarioTitle}`,
            emailHtml,
            [{
                filename: `SecuritySim_Certificate_${scenarioTitle.replace(/\s+/g, '_')}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        );

        if (result.success) {
            res.json({ message: 'Certificate sent successfully!', messageId: result.messageId });
        } else {
            res.status(500).json({ message: 'Failed to send certificate email', error: result.error });
        }
    } catch (error) {
        console.error('Certificate generation error:', error);
        res.status(500).json({ message: 'Error generating certificate', error: error.message });
    }
});


/**
 * Generate a certificate PDF using jsPDF drawing API (no DOM/html2canvas needed server-side)
 * Returns a Buffer of the PDF
 */
function generateCertificatePDF(userName, scenarioTitle, completionDate) {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const pageW = doc.internal.pageSize.getWidth();   // 297mm
    const pageH = doc.internal.pageSize.getHeight();   // 210mm

    // ===== Background =====
    doc.setFillColor(245, 240, 225); // Cream #f5f0e1
    doc.rect(0, 0, pageW, pageH, 'F');

    // ===== Outer Border =====
    doc.setDrawColor(139, 105, 20); // #8b6914
    doc.setLineWidth(0.6);
    doc.rect(4, 4, pageW - 8, pageH - 8, 'S');

    // ===== Inner Border =====
    doc.setLineWidth(0.3);
    doc.rect(8, 8, pageW - 16, pageH - 16, 'S');

    // ===== Corner Accents =====
    doc.setLineWidth(0.8);
    const cornerSize = 10;
    // Top-left
    doc.line(6, 6, 6 + cornerSize, 6);
    doc.line(6, 6, 6, 6 + cornerSize);
    // Top-right
    doc.line(pageW - 6 - cornerSize, 6, pageW - 6, 6);
    doc.line(pageW - 6, 6, pageW - 6, 6 + cornerSize);
    // Bottom-left
    doc.line(6, pageH - 6, 6 + cornerSize, pageH - 6);
    doc.line(6, pageH - 6 - cornerSize, 6, pageH - 6);
    // Bottom-right
    doc.line(pageW - 6 - cornerSize, pageH - 6, pageW - 6, pageH - 6);
    doc.line(pageW - 6, pageH - 6 - cornerSize, pageW - 6, pageH - 6);

    const centerX = pageW / 2;
    let currentY = 28;

    // ===== Medal/Ribbon (decorative circle) =====
    doc.setFillColor(201, 168, 76); // Gold
    doc.circle(centerX, currentY, 8, 'F');
    doc.setFillColor(139, 105, 20);
    doc.circle(centerX, currentY, 5.5, 'F');
    doc.setFillColor(201, 168, 76);
    doc.circle(centerX, currentY, 4, 'F');
    // Ribbon triangles
    doc.setFillColor(139, 105, 20);
    doc.triangle(centerX - 4, currentY + 7, centerX - 1, currentY + 7, centerX - 5, currentY + 14, 'F');
    doc.triangle(centerX + 4, currentY + 7, centerX + 1, currentY + 7, centerX + 5, currentY + 14, 'F');

    currentY += 20;

    // ===== Organization Name =====
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(90, 74, 58);
    doc.text('SecuritySim-Cyber Survival', centerX, currentY, { align: 'center' });

    currentY += 12;

    // ===== Title =====
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(30);
    doc.setTextColor(26, 26, 26);
    doc.text('CERTIFICATE OF COMPLETION', centerX, currentY, { align: 'center' });

    currentY += 12;

    // ===== Subtitle =====
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(90, 74, 58);
    doc.text('THIS CERTIFICATE IS GIVEN TO', centerX, currentY, { align: 'center' });

    currentY += 16;

    // ===== User Name =====
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(42);
    doc.setTextColor(26, 26, 26);
    doc.text(userName, centerX, currentY, { align: 'center' });

    currentY += 14;

    // ===== Body Text =====
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(58, 42, 26);
    const bodyText = `In recognition of your outstanding performance and analytical thinking in completing the "${scenarioTitle}" cybersecurity simulation. Your vigilance, quick decision-making, and commitment to digital defense have demonstrated exemplary skills in cyber threat response.`;
    const splitBody = doc.splitTextToSize(bodyText, 180);
    doc.text(splitBody, centerX, currentY, { align: 'center' });

    currentY += splitBody.length * 5 + 8;

    // ===== Date =====
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(90, 74, 58);
    doc.text(`Awarded on ${completionDate}`, centerX, currentY, { align: 'center' });

    // ===== Footer: Signers =====
    const footerY = pageH - 30;

    // Left signer
    doc.setDrawColor(44, 24, 16);
    doc.setLineWidth(0.4);
    doc.line(35, footerY, 95, footerY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(26, 26, 26);
    doc.text('HARI', 65, footerY + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 74, 58);
    doc.text('HeadQuarters', 65, footerY + 11, { align: 'center' });

    // Right signer
    doc.line(pageW - 95, footerY, pageW - 35, footerY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(26, 26, 26);
    doc.text('HARI', pageW - 65, footerY + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 74, 58);
    doc.text('Director', pageW - 65, footerY + 11, { align: 'center' });

    // ===== Center Seal =====
    const sealX = centerX;
    const sealY = footerY + 3;

    // Verified circle
    doc.setDrawColor(45, 138, 78); // Green
    doc.setLineWidth(0.8);
    doc.circle(sealX, sealY, 10, 'S');

    // Inner filled circle
    doc.setFillColor(45, 138, 78);
    doc.circle(sealX, sealY, 5, 'F');

    // Checkmark
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('✓', sealX, sealY + 1.5, { align: 'center' });

    // Seal text
    doc.setTextColor(45, 138, 78);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.text('CERTIFIED', sealX, sealY - 7, { align: 'center' });
    doc.text('CERTIFIED', sealX, sealY + 12, { align: 'center' });

    // Return as Buffer
    return Buffer.from(doc.output('arraybuffer'));
}

export default router;
