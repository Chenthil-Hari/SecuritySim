import React from 'react';
import { ShieldAlert, LogOut, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './TerminalLocked.css';

const TerminalLocked = () => {
    const { logout } = useAuth();

    return (
        <div className="terminal-locked-overlay">
            <div className="locked-container">
                <div className="glitch-wrapper">
                    <ShieldAlert size={80} className="lock-icon" />
                    <h1 className="glitch-text" data-text="TERMINAL LOCKED">TERMINAL LOCKED</h1>
                </div>

                <div className="security-notice">
                    <div className="notice-header">
                        <Lock size={18} />
                        <span>SECURITY VIOLATION DETECTED</span>
                    </div>
                    <p className="notice-body">
                        Your connection to the Secure Sim Environment has been severed by <strong>Headquarters</strong>.
                        Your digital identity is currently under state-imposed isolation (Frozen).
                    </p>
                    <div className="status-code">
                        ERROR_CODE: AUTH_ISOLATION_403
                    </div>
                </div>

                <div className="locked-actions">
                    <a href="mailto:support@securitysim.com" className="support-btn">
                        <Mail size={18} />
                        Contact Headquarters
                    </a>
                    <button onClick={logout} className="logout-btn">
                        <LogOut size={18} />
                        Return to Login
                    </button>
                </div>

                <div className="terminal-footer">
                    <div className="footer-line">EYES ONLY // TOP SECRET</div>
                    <div className="footer-line secondary">AUTHORIZED PERSONNEL ONLY</div>
                </div>
            </div>

            {/* Background Matrix Effect */}
            <div className="locked-bg-pattern"></div>
        </div>
    );
};

export default TerminalLocked;
