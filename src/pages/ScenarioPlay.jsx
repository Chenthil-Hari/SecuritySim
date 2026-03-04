import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, AlertTriangle, MessageSquare, Trophy, Star, RotateCcw, ArrowRight, PhoneIncoming, PhoneOff, Wifi } from 'lucide-react';
import { useGame, useGameDispatch } from '../context/GameContext';
import { speakScenario, speak } from '../utils/voiceGuidance';
import FeedbackModal from '../components/FeedbackModal';
import { playCorrect, playIncorrect, playTimerTimeout, playScenarioComplete, startAmbient, stopAmbient, isAmbientActive } from '../utils/soundEffects';
import { buildApiUrl } from '../utils/api';
import Character from '../components/Character';
import { useTypewriter, useStaggeredReveal } from '../hooks/useAnimations';
import badgesList from '../data/badges';
import scenariosData from '../data/scenarios';
import characters from '../data/characters';
import Timer from '../components/Timer';
import './ScenarioPlay.css';

/* ====================================================
   ANIMATED VISUAL SUB-COMPONENTS
   ==================================================== */

/* Animated Email — progressive field reveal + typewriter body */
function AnimatedEmail({ vd }) {
    const [phase, setPhase] = useState(0); // 0=toolbar, 1=from, 2=to, 3=subject, 4=body
    const { displayedText: bodyText, isTyping: bodyTyping } = useTypewriter(
        vd.body || '',
        35,       // 35ms per char — slow enough to read
        2400      // start body typing after header fields appear
    );

    useEffect(() => {
        const timers = [
            setTimeout(() => setPhase(1), 400),
            setTimeout(() => setPhase(2), 900),
            setTimeout(() => setPhase(3), 1500),
            setTimeout(() => setPhase(4), 2200),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="email-visual sim-entrance">
            <div className="email-toolbar">
                <span className="email-dot red" />
                <span className="email-dot yellow" />
                <span className="email-dot green" />
                <span className="email-toolbar-label">
                    <Mail size={14} /> Inbox
                </span>
            </div>

            <div className="email-header-info">
                {phase >= 1 && (
                    <div className="email-field sim-field-reveal">
                        <span className="email-field-label">From:</span>
                        <span className="email-field-value suspicious">{vd.from}</span>
                    </div>
                )}
                {phase >= 2 && (
                    <div className="email-field sim-field-reveal">
                        <span className="email-field-label">To:</span>
                        <span className="email-field-value">{vd.to}</span>
                    </div>
                )}
            </div>

            {phase >= 3 && (
                <div className="email-subject sim-field-reveal">
                    <Mail size={16} className="email-subject-icon" /> {vd.subject}
                </div>
            )}

            {phase >= 4 && (
                <div className="email-body">
                    {bodyText}
                    {bodyTyping && <span className="sim-cursor">|</span>}
                    {!bodyTyping && vd.buttonText && (
                        <div className="email-fake-btn sim-btn-appear">{vd.buttonText}</div>
                    )}
                </div>
            )}
        </div>
    );
}

/* Animated Phone — ring animation → connect → transcript types */
function AnimatedPhone({ vd }) {
    const [phase, setPhase] = useState('ringing'); // ringing → connected → transcript
    const { displayedText: transcript, isTyping } = useTypewriter(
        vd.transcript || '',
        28,
        phase === 'transcript' ? 300 : 99999  // only start after connected
    );

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('connected'), 2200);
        const t2 = setTimeout(() => setPhase('transcript'), 3200);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    return (
        <div className="phone-visual sim-entrance">
            <div className={`phone-icon-wrapper ${phase === 'ringing' ? 'phone-ringing' : 'phone-connected'}`}>
                {phase === 'ringing' ? <PhoneIncoming size={36} /> : <Phone size={36} />}
            </div>

            {phase === 'ringing' && (
                <>
                    <div className="phone-caller sim-field-reveal">{vd.callerName}</div>
                    <div className="phone-number sim-field-reveal">{vd.callerNumber}</div>
                    <div className="phone-status-text phone-ring-text">Incoming call...</div>
                    <div className="phone-ring-waves">
                        <span className="ring-wave" />
                        <span className="ring-wave" style={{ animationDelay: '0.3s' }} />
                        <span className="ring-wave" style={{ animationDelay: '0.6s' }} />
                    </div>
                </>
            )}

            {phase !== 'ringing' && (
                <>
                    <div className="phone-caller">{vd.callerName}</div>
                    <div className="phone-number">{vd.callerNumber}</div>
                    <div className="phone-status-text phone-connected-text">
                        <span className="connected-dot" /> Connected · {vd.duration}
                    </div>
                </>
            )}

            {phase === 'transcript' && (
                <div className="phone-transcript sim-field-reveal">
                    &quot;{transcript}{isTyping && <span className="sim-cursor">|</span>}&quot;
                </div>
            )}
        </div>
    );
}

/* Animated Chat — staggered messages with typing indicator */
function AnimatedChat({ vd }) {
    const messages = vd.messages || [];
    const { visibleCount } = useStaggeredReveal(messages, 1200, 800);
    const showTyping = visibleCount < messages.length;

    return (
        <div className="chat-visual sim-entrance">
            <div className="chat-header">
                <div className="chat-avatar">{vd.sender.charAt(0)}</div>
                <div>
                    <div className="chat-sender-name">{vd.sender}</div>
                    <div className="chat-status-online">
                        <span className="online-dot" /> Online
                    </div>
                </div>
            </div>
            <div className="chat-messages">
                {messages.slice(0, visibleCount).map((msg, i) => (
                    <ChatBubbleAnimated text={msg} key={i} index={i} />
                ))}
                {showTyping && (
                    <div className="chat-typing-indicator">
                        <span /><span /><span />
                    </div>
                )}
            </div>
        </div>
    );
}

/* Individual chat bubble with typewriter */
function ChatBubbleAnimated({ text, index }) {
    const { displayedText, isTyping } = useTypewriter(text, 25, 100);
    return (
        <div className="chat-bubble sim-bubble-enter" style={{ animationDelay: `${index * 0.05}s` }}>
            {displayedText}
            {isTyping && <span className="sim-cursor">|</span>}
        </div>
    );
}

/* Animated Popup — scale-in with flashing bar */
function AnimatedPopup({ vd }) {
    const [showBody, setShowBody] = useState(false);
    const { displayedText: msgText, isTyping } = useTypewriter(
        vd.message || '',
        20,
        1200
    );

    useEffect(() => {
        const t = setTimeout(() => setShowBody(true), 800);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="popup-visual sim-popup-entrance">
            <div className="popup-top-bar popup-flash">
                <span>{vd.title}</span>
                <span>✕</span>
            </div>
            {showBody && (
                <div className="popup-body sim-field-reveal">
                    <h3>⚠️ WARNING</h3>
                    <p>
                        {msgText}
                        {isTyping && <span className="sim-cursor">|</span>}
                    </p>
                    {!isTyping && vd.buttonText && (
                        <div className="popup-fake-btn sim-btn-appear">{vd.buttonText}</div>
                    )}
                    {!isTyping && vd.phoneNumber && (
                        <p className="popup-phone sim-btn-appear">Support: {vd.phoneNumber}</p>
                    )}
                </div>
            )}
        </div>
    );
}

/* Animated Decision — typewriter prompt */
function AnimatedDecision({ prompt }) {
    const { displayedText, isTyping } = useTypewriter(prompt, 22, 300);
    return (
        <div className="decision-visual sim-entrance">
            <p className="decision-prompt">
                {displayedText}
                {isTyping && <span className="sim-cursor">|</span>}
            </p>
        </div>
    );
}

/* ====================================================
   MAIN COMPONENT
   ==================================================== */

export default function ScenarioPlay() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const challengeId = searchParams.get('challengeId');
    const { state, dispatch } = useGame(); // Updated useGame hook destructuring

    const scenario = scenariosData.find(s => s.id === id);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [stepResults, setStepResults] = useState([]);
    const [finished, setFinished] = useState(false);
    const [charReaction, setCharReaction] = useState('idle');
    const [timedOut, setTimedOut] = useState(false);
    const [stepStartTime, setStepStartTime] = useState(0);
    const [timeBonusTotal, setTimeBonusTotal] = useState(0);

    const character = characters[id];

    // Initial load and ambient audio
    useEffect(() => {
        if (scenario) {
            speakScenario(scenario, state.settings);
            if (state.settings?.soundEffects) {
                startAmbient();
            }
        }

        // Cleanup ambient audio when leaving scenario
        return () => {
            stopAmbient();
        };
    }, [id, scenario, state.settings]);

    // Reset reaction when step changes
    useEffect(() => {
        if (!showFeedback && !finished) {
            setCharReaction('idle');
            const timer = setTimeout(() => setCharReaction('thinking'), 1500);
            return () => clearTimeout(timer);
        }
    }, [currentStep]);

    // Reset step start time on step change
    useEffect(() => {
        setStepStartTime(Date.now());
        setTimedOut(false);
    }, [currentStep]);

    if (!scenario) {
        return (
            <div className="scenario-play">
                <div className="decision-visual" style={{ textAlign: 'center', padding: '3rem' }}>
                    <AlertTriangle size={48} style={{ color: 'var(--warning)', marginBottom: 16 }} />
                    <h2>Scenario Not Found</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>This scenario doesn't exist.</p>
                    <Link to="/scenarios" className="btn-primary">Back to Scenarios</Link>
                </div>
            </div>
        );
    }

    const step = scenario.steps[currentStep];
    const totalSteps = scenario.steps.length;
    const progress = ((currentStep) / totalSteps) * 100;

    const handleOptionSelect = (option, index) => {
        if (selectedOption !== null) return;
        setSelectedOption(index);
        setShowFeedback(true);
        setStepResults(prev => [...prev, { isCorrect: option.isCorrect }]);

        // Play sound effect
        if (state.settings?.soundEffects) {
            if (option.isCorrect) playCorrect();
            else playIncorrect();
        }

        // Calculate time bonus if timed scenario
        if (scenario.timeLimit && option.isCorrect) {
            const elapsed = (Date.now() - stepStartTime) / 1000;
            const ratio = Math.max(0, 1 - (elapsed / scenario.timeLimit));
            const bonus = Math.round(ratio * 25 * scenario.difficulty);
            setTimeBonusTotal(prev => prev + bonus);
        }
        // Update character reaction based on answer correctness
        setCharReaction(option.isCorrect ? 'relief' : 'panic');
    };

    const handleTimeout = () => {
        if (selectedOption !== null || timedOut) return;
        setTimedOut(true);

        if (state.settings?.soundEffects) {
            playTimerTimeout();
        }

        // Auto-select the first incorrect option
        const wrongIdx = step.options.findIndex(o => !o.isCorrect);
        const idx = wrongIdx >= 0 ? wrongIdx : 0;
        setSelectedOption(idx);
        setShowFeedback(true);
        setStepResults(prev => [...prev, { isCorrect: false }]);
        setCharReaction('panic');
    };

    const handleContinue = () => {
        setShowFeedback(false);

        // Branching logic: If the selected option specifies a nextStep path, use it. Otherwise go to currentStep + 1.
        let nextIndex = currentStep + 1;
        if (selectedOption !== null && step.options[selectedOption].nextStep !== undefined) {
            nextIndex = step.options[selectedOption].nextStep;
        }

        if (nextIndex < totalSteps) {
            setCurrentStep(nextIndex);
            setSelectedOption(null);
            setCharReaction('idle');
            speak(`Step ${nextIndex + 1} of ${totalSteps}`, state.settings);
        } else {
            // Scenario complete
            stopAmbient();
            if (state.settings?.soundEffects) {
                playScenarioComplete();
            }

            const correctCount = [...stepResults].filter(r => r.isCorrect).length;
            const accuracy = Math.round((correctCount / totalSteps) * 100);
            const xpEarned = Math.round(accuracy * 0.5 * scenario.difficulty);

            if (challengeId) {
                // Submit to PvP Challenge endpoint
                try {
                    const token = localStorage.getItem('token');
                    fetch(buildApiUrl(`/api/challenges/${challengeId}/complete`), {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            receiverAccuracy: accuracy,
                            receiverXp: xpEarned
                        })
                    }).then(res => res.json()).then(data => {
                        console.log("Challenge completed:", data.message);
                    });
                } catch (err) {
                    console.error("Error submitting challenge score:", err);
                }
            } else {
                dispatch({
                    type: 'COMPLETE_SCENARIO',
                    payload: {
                        scenarioId: scenario.id,
                        category: scenario.category,
                        accuracy,
                        xpEarned
                    }
                });

                // Check for new badges
                const updatedState = {
                    ...state,
                    completedScenarios: [
                        ...state.completedScenarios,
                        { scenarioId: scenario.id, category: scenario.category, accuracy }
                    ],
                    xp: state.xp + xpEarned,
                    level: Math.floor((state.xp + xpEarned) / 100) + 1,
                    score: accuracy
                };

                badgesList.forEach(badge => {
                    if (!state.badges.includes(badge.id) && badge.condition(updatedState)) {
                        dispatch({ type: 'EARN_BADGE', payload: badge.id });
                    }
                });
            }

            setFinished(true);
            // Set final character reaction based on accuracy
            const finalCorrect = [...stepResults].filter(r => r.isCorrect).length;
            const finalAccuracy = Math.round((finalCorrect / totalSteps) * 100);
            setCharReaction(finalAccuracy >= 60 ? 'confident' : 'confused');
        }
    };

    // Render visual based on type
    const renderVisual = () => {
        const vd = step.visualData;

        switch (step.visualType) {
            case 'email':
                return <AnimatedEmail vd={vd} key={`email-${currentStep}`} />;

            case 'phone':
                return <AnimatedPhone vd={vd} key={`phone-${currentStep}`} />;

            case 'chat':
                return <AnimatedChat vd={vd} key={`chat-${currentStep}`} />;

            case 'popup':
                return <AnimatedPopup vd={vd} key={`popup-${currentStep}`} />;

            case 'decision':
            default:
                return <AnimatedDecision prompt={step.prompt} key={`decision-${currentStep}`} />;
        }
    };

    // Summary Screen
    if (finished) {
        const correctCount = stepResults.filter(r => r.isCorrect).length;
        const accuracy = Math.round((correctCount / totalSteps) * 100);
        const xpEarned = Math.round(accuracy * 0.5 * scenario.difficulty) + timeBonusTotal;
        const grade = accuracy >= 80 ? 'great' : accuracy >= 50 ? 'ok' : 'poor';

        return (
            <div className="scenario-play">
                {character && (
                    <Character character={character} reaction={charReaction} />
                )}
                <div className="scenario-summary">
                    <div className="summary-card">
                        <div className={`summary-icon ${grade}`}>
                            {grade === 'great' ? <Trophy size={40} /> : <Star size={40} />}
                        </div>
                        <h2 className="summary-title">
                            {grade === 'great' ? 'Excellent Work!' : grade === 'ok' ? 'Good Effort!' : 'Keep Practicing!'}
                        </h2>
                        <div className={`summary-accuracy ${grade}`}>{accuracy}%</div>
                        <p className="summary-sub">Accuracy on "{scenario.title}"</p>

                        <div className="summary-stats">
                            <div className="summary-stat">
                                <div className="summary-stat-value" style={{ color: 'var(--success)' }}>{correctCount}</div>
                                <div className="summary-stat-label">Correct</div>
                            </div>
                            <div className="summary-stat">
                                <div className="summary-stat-value" style={{ color: 'var(--danger)' }}>{totalSteps - correctCount}</div>
                                <div className="summary-stat-label">Incorrect</div>
                            </div>
                            <div className="summary-stat">
                                <div className="summary-stat-value" style={{ color: 'var(--warning)' }}>+{xpEarned}</div>
                                <div className="summary-stat-label">XP Earned</div>
                            </div>
                        </div>
                        {timeBonusTotal > 0 && (
                            <div className="summary-stat">
                                <div className="summary-stat-value" style={{ color: 'var(--primary)' }}>+{timeBonusTotal}</div>
                                <div className="summary-stat-label">Time Bonus</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="summary-actions">
                    <button className="btn-outline" onClick={() => {
                        setCurrentStep(0);
                        setSelectedOption(null);
                        setStepResults([]);
                        setFinished(false);
                        setTimeBonusTotal(0);
                    }}>
                        <RotateCcw size={16} /> Try Again
                    </button>
                    {challengeId ? (
                        <Link to="/challenges" className="btn-primary">
                            Back to Challenges <ArrowRight size={16} />
                        </Link>
                    ) : (
                        <Link to="/scenarios" className="btn-primary">
                            Next Scenario <ArrowRight size={16} />
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="scenario-play">
            <div className="scenario-play-header">
                <button className="back-link" onClick={() => navigate('/scenarios')}>
                    <ArrowLeft size={16} /> Back to Scenarios
                </button>

                <div className="scenario-play-meta">
                    <span className={`scenario-card-badge ${scenario.category.toLowerCase().replace(/\s+/g, '-')}`}>
                        {scenario.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Difficulty: {'⬤'.repeat(scenario.difficulty)}{'○'.repeat(3 - scenario.difficulty)}
                    </span>
                </div>

                <h1>{scenario.title}</h1>

                <div className="scenario-play-progress">
                    <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="progress-text">Step {currentStep + 1}/{totalSteps}</span>
                </div>

                {scenario.timeLimit && (
                    <div className="scenario-timer-bar">
                        <Timer
                            key={currentStep}
                            seconds={scenario.timeLimit}
                            onTimeout={handleTimeout}
                            isPaused={showFeedback}
                        />
                        <span className="timer-label">⏱ Time Limit</span>
                    </div>
                )}
            </div>

            {character && (
                <Character character={character} reaction={charReaction} />
            )}

            <div className="scenario-visual" key={currentStep}>
                {renderVisual()}
            </div>

            <div className="scenario-options" key={`opts-${currentStep}`}>
                <h3>What do you do?</h3>
                {step.options.map((option, i) => (
                    <button
                        key={i}
                        className={`option-btn ${selectedOption === i
                            ? option.isCorrect ? 'selected-correct' : 'selected-incorrect'
                            : ''
                            }`}
                        onClick={() => handleOptionSelect(option, i)}
                        disabled={selectedOption !== null}
                    >
                        {option.text}
                    </button>
                ))}
            </div>

            {showFeedback && selectedOption !== null && (
                <FeedbackModal
                    isCorrect={step.options[selectedOption].isCorrect}
                    feedback={step.options[selectedOption].feedback}
                    defenseTip={step.options[selectedOption].defenseTip}
                    xpEarned={step.options[selectedOption].isCorrect ? Math.round(25 * scenario.difficulty) : 5}
                    onContinue={handleContinue}
                />
            )}
        </div>
    );
}
