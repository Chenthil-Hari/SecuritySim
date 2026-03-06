import { CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { speakFeedback } from '../utils/voiceGuidance';
import { useGame } from '../context/GameContext';
import './FeedbackModal.css';

export default function FeedbackModal({ isCorrect, feedback, defenseTip, xpEarned, onContinue }) {
    const { settings } = useGame();

    useEffect(() => {
        try {
            speakFeedback(feedback, settings);
        } catch (e) {
            console.error("Feedback voice error:", e);
        }

        // Prevent scroll when modal is open
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [feedback, settings]);

    return createPortal(
        <div className="feedback-perfect-overlay" onClick={onContinue}>
            <div className={`feedback-perfect-modal ${isCorrect ? 'correct' : 'incorrect'}`} onClick={e => e.stopPropagation()}>
                <div className="feedback-perfect-header">
                    <div className={`feedback-perfect-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? <CheckCircle size={48} /> : <XCircle size={48} />}
                    </div>
                </div>

                <h2 className="feedback-perfect-result">
                    {isCorrect ? 'Mission Accomplished!' : 'Asset Compromised!'}
                </h2>

                <p className="feedback-perfect-text">{feedback}</p>

                {defenseTip && (
                    <div className="feedback-perfect-tip">
                        <div className="tip-perfect-header">
                            <ShieldAlert size={14} /> DEFENSE INTELLIGENCE
                        </div>
                        <p className="tip-perfect-text">{defenseTip}</p>
                    </div>
                )}

                <button className={`feedback-perfect-btn ${isCorrect ? 'correct' : 'incorrect'}`} onClick={onContinue}>
                    Continue Mission
                </button>
            </div>
        </div>,
        document.body
    );
}
