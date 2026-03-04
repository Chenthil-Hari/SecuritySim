import React, { useEffect, useState } from 'react';
import { ShieldAlert, Unlock, HardDriveDownload, Skull, AlertCircle } from 'lucide-react';
import './ConsequenceEngine.css';

export default function ConsequenceEngine({ type, onComplete }) {
    const [phase, setPhase] = useState('entering');

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('active'), 100);
        const t2 = setTimeout(() => setPhase('exiting'), 2500);
        const t3 = setTimeout(() => {
            if (onComplete) onComplete();
        }, 3000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [onComplete]);

    const renderConsequence = () => {
        switch (type) {
            case 'MALWARE':
                return (
                    <div className="consequence-malware">
                        <div className="glitch-text">CRITICAL SYSTEM INFECTION</div>
                        <div className="popup-spam">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="mini-popup" style={{
                                    top: `${Math.random() * 80}%`,
                                    left: `${Math.random() * 80}%`,
                                    animationDelay: `${i * 0.1}s`
                                }}>
                                    <ShieldAlert size={12} /> VIRUS DETECTED
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'EXFILTRATION':
                return (
                    <div className="consequence-exfil">
                        <div className="exfil-header">
                            <HardDriveDownload className="exfil-icon" size={48} />
                            <h3>SENSITIVE DATA EXFILTRATING...</h3>
                        </div>
                        <div className="file-list">
                            <div className="file-item">passwords_db.sql ... <span className="sent">SENT</span></div>
                            <div className="file-item">customer_records.csv ... <span className="sent">SENT</span></div>
                            <div className="file-item">private_keys.key ... <span className="sending">SENDING</span></div>
                        </div>
                        <div className="progress-container">
                            <div className="progress-bar-danger anim-fill" />
                        </div>
                    </div>
                );
            case 'RANSOMWARE':
                return (
                    <div className="consequence-ransom">
                        <Skull size={80} className="ransom-icon" />
                        <h2>YOUR FILES ARE ENCRYPTED</h2>
                        <p>To restore access, send 0.5 BTC to the address below.</p>
                        <div className="btc-address">1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2</div>
                        <div className="countdown">00:59:59 UNTIL DATA WIPE</div>
                    </div>
                );
            default:
                return (
                    <div className="consequence-generic">
                        <AlertCircle size={48} />
                        <h3>SECURITY BREACH DETECTED</h3>
                    </div>
                );
        }
    };

    return (
        <div className={`consequence-overlay ${type.toLowerCase()} phase-${phase}`}>
            <div className="consequence-content">
                {renderConsequence()}
            </div>
            <div className="scanline"></div>
        </div>
    );
}
