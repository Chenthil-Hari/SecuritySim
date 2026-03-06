import { CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { speakFeedback } from '../utils/voiceGuidance';
import { useGame } from '../context/GameContext';
import './FeedbackModal.css';

export default function FeedbackModal({ isCorrect, feedback, defenseTip, xpEarned, onContinue }) {
    const { settings } = useGame();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            speakFeedback(feedback, settings);
        } catch (e) {
            console.error("Feedback voice error:", e);
        }

        // Prevent body scrolling when the overlay is active
        const originalOverflow = document.body.style.overflow || '';
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [feedback, settings]);

    // Safety check for SSR/Portal mounting
    if (!mounted) return null;

    const modalContent = (
        <div className="scenario-global-overlay" onClick={onContinue}>
            <div className={`scenario-feedback-modal ${isCorrect ? 'is-correct' : 'is-incorrect'}`} onClick={e => e.stopPropagation()}>
                <div className="feedback-icon-wrap">
                    {isCorrect ? <CheckCircle size={48} /> : <XCircle size={48} />}
                </div>

                <h2 className="feedback-title">
                    {isCorrect ? 'Mission Accomplished' : 'Asset Compromised'}
                </h2>

                <p className="feedback-message">{feedback}</p>

                {defenseTip && (
                    <div className="feedback-defense-card">
                        <div className="defense-card-header">
                            <ShieldAlert size={14} /> DEFENSE INTELLIGENCE
                        </div>
                        <p className="defense-card-text">{defenseTip}</p>
                    </div>
                )}

                <button className="feedback-action-btn" onClick={onContinue}>
                    Continue Mission
                </button>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
