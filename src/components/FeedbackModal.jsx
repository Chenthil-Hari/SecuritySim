import { CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { speakFeedback } from '../utils/voiceGuidance';
import { useGame } from '../context/GameContext';
import './FeedbackModal.css';

export default function FeedbackModal({ isCorrect, feedback, defenseTip, xpEarned, onContinue }) {
    const { settings } = useGame();

    useEffect(() => {
        speakFeedback(feedback, settings);
    }, [feedback, settings]);

    return ReactDOM.createPortal(
        <div className="feedback-overlay" onClick={onContinue} role="dialog" aria-modal="true" aria-label="Feedback">
            <div className={`feedback-modal ${isCorrect ? 'correct' : 'incorrect'}`} onClick={e => e.stopPropagation()}>
                <div className="feedback-icon-wrapper">
                    <div className={`feedback-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? <CheckCircle size={32} /> : <XCircle size={32} />}
                    </div>
                </div>

                <div className={`feedback-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? 'Correct!' : 'Not Quite Right'}
                </div>

                <p className="feedback-text">{feedback}</p>

                {defenseTip && (
                    <div className="feedback-tip">
                        <div className="feedback-tip-label">
                            <ShieldAlert size={12} style={{ display: 'inline', marginRight: 4 }} />
                            Defense Tip
                        </div>
                        <p className="feedback-tip-text">{defenseTip}</p>
                    </div>
                )}

                {xpEarned > 0 && (
                    <div className="feedback-xp">+{xpEarned} XP earned!</div>
                )}

                <button className={`feedback-btn ${isCorrect ? 'correct' : 'incorrect'}`} onClick={onContinue}>
                    Continue
                </button>
            </div>
        </div>,
        document.body
    );
}
