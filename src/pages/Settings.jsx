import { Accessibility, Volume2, Eye, AlertTriangle, Info, RotateCcw } from 'lucide-react';
import { useGame, useGameDispatch } from '../context/GameContext';
import { speak, stop } from '../utils/voiceGuidance';
import './Settings.css';

export default function Settings() {
    const { settings } = useGame();
    const dispatch = useGameDispatch();

    const updateSetting = (key, value) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });

        if (key === 'voiceGuidance' && value) {
            speak('Voice guidance is now enabled. You will hear scenario text and feedback read aloud.', { voiceGuidance: true });
        }
        if (key === 'voiceGuidance' && !value) {
            stop();
        }
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all progress? This will clear your score, XP, badges, and completed scenarios. This action cannot be undone.')) {
            dispatch({ type: 'RESET_PROGRESS' });
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>Settings</h1>
                <p>Customize your SecuritySim:Cyber Survival experience</p>
            </div>

            <div className="settings-section">
                <h2><Accessibility size={20} /> Accessibility</h2>

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
                        <div className="setting-label">Voice Guidance</div>
                        <div className="setting-desc">Read scenario text and feedback aloud using speech synthesis</div>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={settings.voiceGuidance}
                            onChange={e => updateSetting('voiceGuidance', e.target.checked)}
                            aria-label="Toggle voice guidance"
                        />
                        <span className="toggle-slider" />
                    </label>
                </div>
            </div>

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
        </div>
    );
}
