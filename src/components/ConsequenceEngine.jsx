import React, { useEffect, useState } from 'react';
import { AlertTriangle, Lock, ShieldAlert, WifiOff, HardDrive, FileWarning } from 'lucide-react';
import './ConsequenceEngine.css';

const GLITCH_STRINGS = [
    'SYSTEM_HALT', 'ADDR_ERR: 0x000F42', 'CORE_DUMP_FLUSH', 'KERNEL_PANIC',
    'EXFILTRATING_PASSWORDS...', 'ENCRYPTING_DRIVE_C:', 'BACKDOOR_OPENED',
    'WIPE_SECTOR_0', 'TRACING_IP...', 'ROOT_ACCESS_GRANTED'
];

const LEAKING_DATA = [
    'admin_pass: *********', 'db_root_key: a7f8-92b1-55c3', 'user_session_id: 8829',
    'credit_card_mask: 4242-XXXX-XXXX-0012', 'crypto_wallet_seed: private',
    'ssn_payload: 555-XXX-0012', 'internal_ip: 10.0.0.45', 'dns_poison: success'
];

export default function ConsequenceEngine({ type, message, onComplete }) {
    const [glitchText, setGlitchText] = useState('');
    const [leakLines, setLeakLines] = useState([]);
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        if (type === 'glitch') {
            const interval = setInterval(() => {
                setGlitchText(prev => GLITCH_STRINGS[Math.floor(Math.random() * GLITCH_STRINGS.length)]);
            }, 150);
            return () => clearInterval(interval);
        }
    }, [type]);

    useEffect(() => {
        if (type === 'leak') {
            const interval = setInterval(() => {
                setLeakLines(prev => [...prev.slice(-10), LEAKING_DATA[Math.floor(Math.random() * LEAKING_DATA.length)]]);
            }, 300);
            return () => clearInterval(interval);
        }
    }, [type]);

    useEffect(() => {
        if (type === 'ransom') {
            const interval = setInterval(() => {
                setCountdown(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [type]);

    if (!type) return null;

    return (
        <div className={`consequence-overlay ${type}`}>
            {type === 'glitch' && (
                <div className="glitch-container">
                    <div className="glitch-text" data-text={glitchText}>{glitchText}</div>
                    <div className="glitch-block"></div>
                    <div className="glitch-block"></div>
                    <div className="glitch-block"></div>
                </div>
            )}

            {type === 'leak' && (
                <div className="leak-container">
                    <div className="leak-header">
                        <ShieldAlert className="blink" /> DATA EXFILTRATION IN PROGRESS
                    </div>
                    <div className="leak-list">
                        {leakLines.map((line, i) => (
                            <div key={i} className="leak-line">{">>>"} {line}</div>
                        ))}
                    </div>
                    <div className="leak-footer">CONNECTION: STABLE | BYTES: {(leakLines.length * 124).toLocaleString()}KB</div>
                </div>
            )}

            {type === 'ransom' && (
                <div className="ransom-container">
                    <div className="ransom-card">
                        <div className="ransom-header">
                            <Lock size={48} />
                            <h1>YOUR FILES ARE ENCRYPTED</h1>
                        </div>
                        <div className="ransom-body">
                            <p>Many of your documents, photos, videos, and other files are no longer accessible because they have been encrypted.</p>
                            <p>To decrypt your files, you must pay <strong>0.5 BTC</strong> to the following address:</p>
                            <div className="btc-address">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</div>
                            <div className="ransom-timer">
                                <span>Time Remaining:</span>
                                <div className="timer-val">
                                    00:{countdown.toString().padStart(2, '0')}:00
                                </div>
                            </div>
                            <div className="ransom-warning">
                                <AlertTriangle size={16} /> If the countdown reaches zero, all files will be permanently deleted.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
