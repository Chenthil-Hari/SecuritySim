import { CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { speakFeedback } from '../utils/voiceGuidance';
import { useGame } from '../context/GameContext';
import './FeedbackModal.css';

export default function FeedbackModal({ isCorrect, feedback, defenseTip, xpEarned, onContinue }) {
    const { settings } = useGame();

    useEffect(() => {
        // Voice guidance
        try {
            speakFeedback(feedback, settings);
        } catch (e) {
            console.error("Feedback voice error:", e);
        }

        // Prevent scroll
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [feedback, settings]);

    // Render directly to document.body for ultimate layering
    return createPortal(
        <div className="feedback-master-overlay" onClick={onContinue}>
            <div className={`feedback-master-modal ${isCorrect ? 'correct' : 'incorrect'}`} onClick={e => e.stopPropagation()}>
                <div className="feedback-master-header">
                    <div className={`feedback-master-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? <CheckCircle size={40} /> : <XCircle size={40} />}
                    </div>
                    <h2 className="feedback-master-title">
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                    </h2>
                </div>

                <div className="feedback-master-content">
                    <p className="feedback-main-text">{feedback}</p>

                    {defenseTip && (
                        <div className="feedback-master-tip">
                            <div className="tip-header"><ShieldAlert size={16} /> Defense Tip</div>
                            <p>{defenseTip}</p>
                        </div>
                    )}
                </div>

                <button className="feedback-master-button" onClick={onContinue}>
                    Continue Scenario
                </button>
            </div>
        </div>,
        document.body
    );
}
