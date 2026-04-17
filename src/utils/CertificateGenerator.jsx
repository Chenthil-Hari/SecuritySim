import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { buildApiUrl } from './api';

/**
 * Generate a certificate PDF matching the SecuritySim template.
 * 
 * @param {object} options
 * @param {string} options.userName - The user's display name
 * @param {string} options.scenarioTitle - The scenario/mission that was completed
 * @param {string} options.completionDate - Formatted date string (e.g. "April 17, 2026")
 * @returns {Promise<{ blob: Blob, base64: string }>} The PDF as both a Blob (for download) and base64 (for backend)
 */
export async function generateCertificatePDF({ userName, scenarioTitle, completionDate }) {
    // Create the certificate HTML container
    const container = document.createElement('div');
    container.id = 'certificate-render-target';
    container.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        z-index: -1;
        pointer-events: none;
    `;

    container.innerHTML = buildCertificateHTML(userName, scenarioTitle, completionDate);
    document.body.appendChild(container);

    const certEl = container.querySelector('.certificate-wrapper');

    try {
        // Wait for fonts to load
        await document.fonts.ready;
        // Small delay to ensure rendering is complete
        await new Promise(resolve => setTimeout(resolve, 300));

        const canvas = await html2canvas(certEl, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            width: 1122,
            height: 793,
        });

        // Create landscape A4 PDF
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgData = canvas.toDataURL('image/png', 1.0);
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        const blob = pdf.output('blob');
        const base64 = pdf.output('datauristring').split(',')[1];

        return { blob, base64 };
    } finally {
        document.body.removeChild(container);
    }
}

/**
 * Trigger a browser download of the certificate PDF
 */
export async function downloadCertificate({ userName, scenarioTitle, completionDate }) {
    const { blob } = await generateCertificatePDF({ userName, scenarioTitle, completionDate });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SecuritySim_Certificate_${scenarioTitle.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Send certificate to the user's email via backend
 */
export async function emailCertificate({ scenarioTitle }) {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
        const res = await fetch(buildApiUrl('/api/certificate/send'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ scenarioTitle })
        });

        const data = await res.json();
        return { success: res.ok, ...data };
    } catch (err) {
        console.error('Certificate email error:', err);
        return { success: false, error: err.message };
    }
}


/* ============================================================
   CERTIFICATE HTML TEMPLATE
   Matches the user's provided design exactly
   ============================================================ */
function buildCertificateHTML(userName, scenarioTitle, completionDate) {
    return `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@700;900&family=Lora:ital,wght@0,400;0,700;1,400&family=Tangerine:wght@700&display=swap');
        
        .certificate-wrapper {
            width: 1122px;
            height: 793px;
            background: #f5f0e1;
            position: relative;
            font-family: 'Lora', 'Georgia', serif;
            color: #2c1810;
            overflow: hidden;
            box-sizing: border-box;
        }

        .cert-outer-border {
            position: absolute;
            top: 12px;
            left: 12px;
            right: 12px;
            bottom: 12px;
            border: 2px solid #8b6914;
        }

        .cert-inner-border {
            position: absolute;
            top: 24px;
            left: 24px;
            right: 24px;
            bottom: 24px;
            border: 1px solid #8b6914;
        }

        .cert-corner-tl, .cert-corner-tr, .cert-corner-bl, .cert-corner-br {
            position: absolute;
            width: 30px;
            height: 30px;
        }

        .cert-corner-tl {
            top: 18px;
            left: 18px;
            border-top: 3px solid #8b6914;
            border-left: 3px solid #8b6914;
        }

        .cert-corner-tr {
            top: 18px;
            right: 18px;
            border-top: 3px solid #8b6914;
            border-right: 3px solid #8b6914;
        }

        .cert-corner-bl {
            bottom: 18px;
            left: 18px;
            border-bottom: 3px solid #8b6914;
            border-left: 3px solid #8b6914;
        }

        .cert-corner-br {
            bottom: 18px;
            right: 18px;
            border-bottom: 3px solid #8b6914;
            border-right: 3px solid #8b6914;
        }

        .cert-content {
            position: absolute;
            top: 40px;
            left: 50px;
            right: 50px;
            bottom: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .cert-medal {
            width: 60px;
            height: 60px;
            margin-bottom: 6px;
        }

        .cert-medal-circle {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #c9a84c 0%, #8b6914 50%, #c9a84c 100%);
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(139, 105, 20, 0.4);
            position: relative;
        }

        .cert-medal-circle::before {
            content: '';
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 12px;
            background: linear-gradient(135deg, #c9a84c 0%, #8b6914 100%);
            border-radius: 50% 50% 0 0;
        }

        .cert-medal-inner {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .cert-medal-ribbon {
            display: flex;
            justify-content: center;
            gap: 4px;
            margin-top: -4px;
        }

        .cert-ribbon-left, .cert-ribbon-right {
            width: 12px;
            height: 18px;
            background: #8b6914;
        }

        .cert-ribbon-left {
            transform: skewX(15deg);
            border-radius: 0 0 0 4px;
        }

        .cert-ribbon-right {
            transform: skewX(-15deg);
            border-radius: 0 0 4px 0;
        }

        .cert-org-name {
            font-family: 'Lora', serif;
            font-size: 16px;
            letter-spacing: 2px;
            color: #5a4a3a;
            margin-bottom: 4px;
        }

        .cert-title {
            font-family: 'Cinzel', serif;
            font-size: 38px;
            font-weight: 900;
            color: #1a1a1a;
            text-transform: uppercase;
            letter-spacing: 4px;
            margin-bottom: 4px;
        }

        .cert-subtitle {
            font-family: 'Lora', serif;
            font-size: 15px;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #5a4a3a;
            margin-bottom: 14px;
        }

        .cert-name {
            font-family: 'Tangerine', cursive;
            font-size: 72px;
            font-weight: 700;
            color: #1a1a1a;
            line-height: 1;
            margin-bottom: 12px;
            text-align: center;
            min-width: 300px;
        }

        .cert-body {
            max-width: 680px;
            text-align: center;
            font-family: 'Lora', serif;
            font-size: 13px;
            line-height: 1.7;
            color: #3a2a1a;
            margin-bottom: 14px;
        }

        .cert-date {
            font-family: 'Lora', serif;
            font-size: 12px;
            color: #5a4a3a;
            font-style: italic;
            margin-bottom: 20px;
        }

        .cert-footer {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            width: 100%;
            max-width: 820px;
            padding: 0 20px;
        }

        .cert-signer {
            text-align: center;
            min-width: 180px;
        }

        .cert-signer-name {
            font-family: 'Cinzel', serif;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 2px;
            border-top: 2px solid #2c1810;
            padding-top: 8px;
            margin-bottom: 2px;
        }

        .cert-signer-role {
            font-family: 'Lora', serif;
            font-size: 12px;
            color: #5a4a3a;
        }

        .cert-seal-container {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .cert-qr {
            width: 64px;
            height: 64px;
            background: #1a1a1a;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
        }

        .cert-qr-inner {
            width: 100%;
            height: 100%;
            background: white;
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            grid-template-rows: repeat(8, 1fr);
            gap: 1px;
            padding: 2px;
        }

        .cert-qr-cell {
            background: #1a1a1a;
        }

        .cert-qr-cell.w {
            background: white;
        }

        .cert-verified-seal {
            width: 60px;
            height: 60px;
            position: relative;
        }

        .cert-seal-outer {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: 3px solid #2d8a4e;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .cert-seal-text-top {
            position: absolute;
            top: 4px;
            font-family: 'Cinzel', serif;
            font-size: 7px;
            font-weight: 700;
            color: #2d8a4e;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .cert-seal-text-bottom {
            position: absolute;
            bottom: 4px;
            font-family: 'Cinzel', serif;
            font-size: 7px;
            font-weight: 700;
            color: #2d8a4e;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .cert-seal-check {
            width: 22px;
            height: 22px;
            background: #2d8a4e;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: bold;
        }
    </style>

    <div class="certificate-wrapper">
        <!-- Borders -->
        <div class="cert-outer-border"></div>
        <div class="cert-inner-border"></div>
        <div class="cert-corner-tl"></div>
        <div class="cert-corner-tr"></div>
        <div class="cert-corner-bl"></div>
        <div class="cert-corner-br"></div>

        <!-- Content -->
        <div class="cert-content">
            <!-- Medal -->
            <div class="cert-medal">
                <div class="cert-medal-circle">
                    <div class="cert-medal-inner"></div>
                </div>
                <div class="cert-medal-ribbon">
                    <div class="cert-ribbon-left"></div>
                    <div class="cert-ribbon-right"></div>
                </div>
            </div>

            <div class="cert-org-name">SecuritySim-Cyber Survival</div>
            <div class="cert-title">Certificate of Completion</div>
            <div class="cert-subtitle">This certificate is given to</div>

            <div class="cert-name">${escapeHTML(userName)}</div>

            <div class="cert-body">
                In recognition of your outstanding performance and analytical thinking
                in completing the <strong>"${escapeHTML(scenarioTitle)}"</strong> cybersecurity simulation.
                Your vigilance, quick decision-making, and commitment to digital defense
                have demonstrated exemplary skills in cyber threat response.
            </div>

            <div class="cert-date">Awarded on ${escapeHTML(completionDate)}</div>

            <!-- Footer -->
            <div class="cert-footer">
                <div class="cert-signer">
                    <div class="cert-signer-name">HARI</div>
                    <div class="cert-signer-role">HeadQuarters</div>
                </div>

                <div class="cert-seal-container">
                    <!-- QR Code (decorative) -->
                    <div class="cert-qr">
                        <div class="cert-qr-inner">
                            <div class="cert-qr-cell"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div>
                            <div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell"></div>
                            <div class="cert-qr-cell"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div>
                            <div class="cert-qr-cell w"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell w"></div>
                            <div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell"></div>
                            <div class="cert-qr-cell"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div>
                            <div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell"></div>
                            <div class="cert-qr-cell w"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell w"></div><div class="cert-qr-cell"></div><div class="cert-qr-cell"></div>
                        </div>
                    </div>

                    <!-- Verified Seal -->
                    <div class="cert-verified-seal">
                        <div class="cert-seal-outer">
                            <div class="cert-seal-text-top">CERTIFIED</div>
                            <div class="cert-seal-check">✓</div>
                            <div class="cert-seal-text-bottom">CERTIFIED</div>
                        </div>
                    </div>
                </div>

                <div class="cert-signer">
                    <div class="cert-signer-name">HARI</div>
                    <div class="cert-signer-role">Director</div>
                </div>
            </div>
        </div>
    </div>
    `;
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
