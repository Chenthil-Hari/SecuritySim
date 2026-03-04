import { useState, useEffect } from 'react';
import { Mail, ArrowRight, User, Server, ShieldAlert, AlertTriangle, Phone, Mic, Lock, HardDrive, Usb, Eye, ChevronRight, Play } from 'lucide-react';
import './AttackExplainer.css';

/* ====================================================
   PER-CATEGORY EXPLAINER DATA
   ==================================================== */

const explainers = {
    Phishing: {
        title: 'How Phishing Works',
        color: '#f59e0b',
        steps: [
            {
                id: 'crafts',
                label: 'Attacker crafts\na fake email',
                icon: <Mail size={24} />,
                nodeClass: 'node-attacker',
                detail: 'Spoofs a trusted brand (bank, Google, HR)',
            },
            {
                id: 'sends',
                label: 'Email sent\nto victim',
                icon: <User size={24} />,
                nodeClass: 'node-victim',
                detail: 'Creates urgency: "Your account will be suspended!"',
            },
            {
                id: 'clicks',
                label: 'Victim clicks\nfake link',
                icon: <AlertTriangle size={24} />,
                nodeClass: 'node-action',
                detail: 'URL is similar but not identical: g00gle.com',
            },
            {
                id: 'stolen',
                label: 'Credentials\nstolen',
                icon: <Lock size={24} />,
                nodeClass: 'node-danger',
                detail: 'Login details sent directly to attacker\'s server',
            },
        ],
    },
    'Scam Calls': {
        title: 'How Vishing (Voice Phishing) Works',
        color: '#8b5cf6',
        steps: [
            {
                id: 'caller',
                label: 'Attacker calls\nwith fake ID',
                icon: <Phone size={24} />,
                nodeClass: 'node-attacker',
                detail: 'Caller ID spoofed to show "Bank" or "IRS"',
            },
            {
                id: 'pressures',
                label: 'Creates fear\nor urgency',
                icon: <AlertTriangle size={24} />,
                nodeClass: 'node-action',
                detail: '"Your account has been compromised! Act now!"',
            },
            {
                id: 'records',
                label: 'Records your\nvoice / extracts OTP',
                icon: <Mic size={24} />,
                nodeClass: 'node-victim',
                detail: 'AI can clone your voice from just 3 seconds of audio',
            },
            {
                id: 'accesses',
                label: 'Account\ntaken over',
                icon: <Lock size={24} />,
                nodeClass: 'node-danger',
                detail: 'Uses OTP + voice clone to bypass 2FA and unlock account',
            },
        ],
    },
    Malware: {
        title: 'How Malware Infects Your System',
        color: '#ef4444',
        steps: [
            {
                id: 'lure',
                label: 'Malicious file\nor link',
                icon: <Mail size={24} />,
                nodeClass: 'node-attacker',
                detail: 'Disguised as: invoice.pdf.exe, setup.msi, codec.zip',
            },
            {
                id: 'execute',
                label: 'User\nexecutes file',
                icon: <User size={24} />,
                nodeClass: 'node-victim',
                detail: 'Appears harmless — may even show a real document',
            },
            {
                id: 'persist',
                label: 'Malware gains\npersistence',
                icon: <Server size={24} />,
                nodeClass: 'node-action',
                detail: 'Adds itself to startup, registry, or scheduled tasks',
            },
            {
                id: 'exfil',
                label: 'Data encrypted\nor exfiltrated',
                icon: <HardDrive size={24} />,
                nodeClass: 'node-danger',
                detail: 'Files locked for ransom, or silently copied to C2 server',
            },
        ],
    },
    'Social Engineering': {
        title: 'How Social Engineering Works',
        color: '#06b6d4',
        steps: [
            {
                id: 'research',
                label: 'Attacker\nresearches target',
                icon: <Eye size={24} />,
                nodeClass: 'node-attacker',
                detail: 'LinkedIn, social media, company website used for recon',
            },
            {
                id: 'builds',
                label: 'Builds trust\nover time',
                icon: <User size={24} />,
                nodeClass: 'node-victim',
                detail: 'Pretends to be a colleague, vendor, or authority figure',
            },
            {
                id: 'exploits',
                label: 'Exploits human\npsychology',
                icon: <AlertTriangle size={24} />,
                nodeClass: 'node-action',
                detail: 'Uses: urgency, authority, reciprocity, fear, scarcity',
            },
            {
                id: 'breached',
                label: 'Information or\naccess obtained',
                icon: <Lock size={24} />,
                nodeClass: 'node-danger',
                detail: 'No technical exploit needed — humans are the vulnerability',
            },
        ],
    },
    'Physical Security': {
        title: 'How Physical Attacks Work',
        color: '#10b981',
        steps: [
            {
                id: 'observe',
                label: 'Attacker\nobserves target',
                icon: <Eye size={24} />,
                nodeClass: 'node-attacker',
                detail: 'Studies badge access patterns, schedules, entry points',
            },
            {
                id: 'infiltrate',
                label: 'Gains physical\naccess',
                icon: <User size={24} />,
                nodeClass: 'node-victim',
                detail: 'Tailgating, impersonation, baiting with USB drives',
            },
            {
                id: 'plants',
                label: 'Plants device\nor steals assets',
                icon: <Usb size={24} />,
                nodeClass: 'node-action',
                detail: 'Hardware keylogger, rogue USB, stolen laptop / access card',
            },
            {
                id: 'exfil',
                label: 'Data or\naccess compromised',
                icon: <Lock size={24} />,
                nodeClass: 'node-danger',
                detail: 'Long-term persistence inside the physical network',
            },
        ],
    },
};

/* ====================================================
   COMPONENT
   ==================================================== */

export default function AttackExplainer({ category, onSkip }) {
    const data = explainers[category] || explainers['Phishing'];
    const [phase, setPhase] = useState(0);
    const [countdown, setCountdown] = useState(12);
    const [canSkip, setCanSkip] = useState(false);

    // Auto-advance phases
    useEffect(() => {
        if (phase >= data.steps.length) return;
        const delay = phase === 0 ? 400 : 2200;
        const t = setTimeout(() => setPhase(p => p + 1), delay);
        return () => clearTimeout(t);
    }, [phase, data.steps.length]);

    // Countdown and skip
    useEffect(() => {
        const t = setTimeout(() => setCanSkip(true), 2000);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (countdown <= 0) { onSkip(); return; }
        const t = setInterval(() => setCountdown(c => c - 1), 1000);
        return () => clearInterval(t);
    }, [countdown, onSkip]);

    return (
        <div className="explainer-overlay">
            <div className="explainer-card">
                {/* Header */}
                <div className="explainer-header">
                    <div className="explainer-badge" style={{ background: `${data.color}22`, color: data.color, border: `1px solid ${data.color}44` }}>
                        <ShieldAlert size={14} /> {category}
                    </div>
                    <h2 className="explainer-title">{data.title}</h2>
                    <p className="explainer-subtitle">Understanding the attack before you face it</p>
                </div>

                {/* Diagram */}
                <div className="explainer-diagram">
                    {data.steps.map((step, i) => (
                        <div key={step.id} className="explainer-step-group">
                            {/* Node */}
                            <div className={`explainer-node ${step.nodeClass} ${phase > i ? 'active' : ''}`}>
                                <div className="node-icon">{step.icon}</div>
                                <div className="node-label">{step.label}</div>
                            </div>

                            {/* Detail bubble */}
                            {phase > i && (
                                <div className="node-detail-bubble">
                                    {step.detail}
                                </div>
                            )}

                            {/* Arrow */}
                            {i < data.steps.length - 1 && (
                                <div className={`explainer-arrow ${phase > i ? 'active' : ''}`}>
                                    <ArrowRight size={20} />
                                    <div className="arrow-flow-line" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="explainer-footer">
                    <div className="explainer-countdown">
                        <div className="countdown-ring" style={{ '--pct': `${(countdown / 12) * 100}%`, '--color': data.color }}>
                            <span>{countdown}</span>
                        </div>
                        Auto-starting in {countdown}s
                    </div>
                    {canSkip && (
                        <button className="explainer-skip-btn" onClick={onSkip} style={{ '--color': data.color }}>
                            Start Now <Play size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
