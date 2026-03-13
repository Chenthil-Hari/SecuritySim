import { Accessibility, Volume2, Eye, AlertTriangle, Info, RotateCcw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGame, useGameDispatch } from '../context/GameContext';
import accessibilityIcon from '../assets/accessibility-icon.png';
import { usePWA } from '../context/PWAContext';
import { Download } from 'lucide-react';
import './Settings.css';

export default function Settings() {
    const navigate = useNavigate();
    const { settings } = useGame();
    const dispatch = useGameDispatch();
    const { isInstallable, installApp } = usePWA();

    const updateSetting = (key, value) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all progress? This will clear your score, XP, badges, and completed scenarios. This action cannot be undone.')) {
            dispatch({ type: 'RESET_PROGRESS' });
        }
    };

    return (
        <div className="settings-page">
            <div className="page-top-nav">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>
            </div>
            <div className="settings-header">
                <h1>Settings</h1>
                <p>Customize your SecuritySim:Cyber Survival experience</p>
            </div>

            <div className="settings-section">
                <h2><img src={accessibilityIcon} alt="" className="section-icon" /> Accessibility</h2>

                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-label">High Contrast Mode</div>
                        <div className="setting-desc">Increases contrast for better readability (WCAG AAA)</div>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={settings.highContrast}
                            onChange={e => updateSetting('highContrast', e.target.checked)}
                            aria-label="Toggle high contrast mode"
                        />
                        <span className="toggle-slider" />
                    </label>
                </div>


                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-label">Sound Effects & Ambient Audio</div>
                        <div className="setting-desc">Alert sounds, feedback tones, and ambient hacking atmosphere during scenarios</div>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={settings.soundEffects}
                            onChange={e => updateSetting('soundEffects', e.target.checked)}
                            aria-label="Toggle sound effects"
                        />
                        <span className="toggle-slider" />
                    </label>
                </div>
            </div>

            {isInstallable && (
                <div className="settings-section install-section">
                    <h2><Download size={20} /> App Installation</h2>
                    <div className="setting-item">
                        <div className="setting-info">
                            <div className="setting-label">Install SecuritySim</div>
                            <div className="setting-desc">Install as a standalone app for better performance and quick access on Desktop or Mobile.</div>
                        </div>
                        <button className="primary-btn" onClick={installApp}>
                            <Download size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                            Install Now
                        </button>
                    </div>
                </div>
            )}

            <div className="settings-section danger-section">
                <h2><AlertTriangle size={20} /> Danger Zone</h2>

                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-label">Reset All Progress</div>
                        <div className="setting-desc">Clear score, XP, badges, and completed scenarios</div>
                    </div>
                    <button className="reset-btn" onClick={handleReset}>
                        <RotateCcw size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                        Reset
                    </button>
                </div>
            </div>

            <div className="settings-section about-section">
                <h2><Info size={20} /> About SecuritySim:Cyber Survival</h2>
                <p>
                    SecuritySim:Cyber Survival is an adaptive, decision-based cybersecurity simulation platform that helps users
                    identify and respond to real-world cyber threats through gamified learning experiences.
                </p>
                <p>
                    Practice handling phishing emails, AI scam calls, malware attacks, and social engineering attempts
                    in a safe environment, and build the skills to protect yourself online.
                </p>
                <div className="about-version">Version 1.0.0</div>
            </div>
        </div >
    );
}
