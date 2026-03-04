import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, AlertTriangle, MessageSquare, Trophy, Star, RotateCcw, ArrowRight, PhoneIncoming, PhoneOff, Wifi, Globe, Lock, Unlock, FolderOpen, FileText, FileWarning, Shield, Signal, Briefcase, Heart, MessageCircle, Share2, ChevronRight, HardDrive, File, Image, Paperclip, CheckCircle, XCircle, WifiOff } from 'lucide-react';
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
import DesktopSim from '../components/DesktopSim';
import './ScenarioPlay.css';

/* ====================================================
   ANIMATED VISUAL SUB-COMPONENTS
   ==================================================== */

function AnimatedEmail({ vd }) {
    const [phase, setPhase] = useState(0);
    const { displayedText: bodyText } = useTypewriter(vd.body || '', 35, 2400);

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
                <span className="email-toolbar-label"><Mail size={14} /> Inbox</span>
            </div>
            <div className="email-header-info">
                {phase >= 1 && <div className="email-field sim-field-reveal"><span className="email-field-label">From:</span><span className="email-field-value suspicious">{vd.from}</span></div>}
                {phase >= 2 && <div className="email-field sim-field-reveal"><span className="email-field-label">To:</span><span className="email-field-value">you@email.com</span></div>}
                {phase >= 3 && <div className="email-field sim-field-reveal"><span className="email-field-label">Subject:</span><span className="email-field-value bold">{vd.subject}</span></div>}
            </div>
            {phase >= 4 && <div className="email-body">{bodyText}</div>}
        </div>
    );
}

function AnimatedPhone({ vd }) {
    const [connected, setConnected] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setConnected(true), 2500);
        return () => clearTimeout(t);
    }, []);
    return (
        <div className="phone-visual sim-entrance">
            <div className={`phone-call-status ${connected ? 'connected' : 'ringing'}`}>
                {connected ? <Phone size={32} /> : <PhoneIncoming size={32} className="ring-anim" />}
                <h3>{connected ? 'Active Call...' : 'Incoming Call'}</h3>
                <p className="caller-id">{vd.caller || 'Unknown Number'}</p>
            </div>
            {connected && vd.transcript && <div className="phone-transcript typewriter">{vd.transcript}</div>}
        </div>
    );
}

function AnimatedChat({ vd }) {
    return (
        <div className="chat-visual sim-entrance">
            <div className="chat-header"><MessageSquare size={16} /> Secure Chat</div>
            <div className="chat-messages">
                {vd.messages?.map((m, i) => (
                    <div key={i} className={`chat-message ${m.sender === 'System' ? 'system' : 'user'}`} style={{ animationDelay: `${i * 0.8}s` }}>
                        <span className="sender">{m.sender}:</span> {m.text}
                    </div>
                ))}
            </div>
        </div>
    );
}

function AnimatedPopup({ vd }) {
    return (
        <div className="popup-visual sim-entrance">
            <div className="popup-card">
                <div className="popup-header"><AlertTriangle size={20} /> {vd.title || 'System Alert'}</div>
                <div className="popup-content">{vd.message}</div>
            </div>
        </div>
    );
}

function AnimatedDecision({ prompt }) {
    return (
        <div className="decision-visual sim-entrance">
            <div className="decision-card"><p>{prompt}</p></div>
        </div>
    );
}

function AnimatedBrowser({ vd }) {
    return (
        <div className="browser-visual sim-entrance">
            <div className="browser-chrome">
                <div className="browser-dots"><span className="dot red" /><span className="dot yellow" /><span className="dot green" /></div>
                <div className="browser-url-bar">
                    {vd.isSecure ? <Lock size={12} className="text-success" /> : <Unlock size={12} className="text-danger" />}
                    <span className="url-text">{vd.url}</span>
                </div>
            </div>
            <div className="browser-content">
                <h2>{vd.pageTitle}</h2>
                <p>{vd.pageContent}</p>
                {vd.formFields?.map((f, i) => <div key={i} className="browser-field"><label>{f}</label><input type="text" disabled /></div>)}
                {vd.submitButton && <button className="btn-primary" disabled>{vd.submitButton}</button>}
            </div>
        </div>
    );
}

function AnimatedFileExplorer({ vd }) {
    return (
        <div className="explorer-visual sim-entrance">
            <div className="explorer-header"><FolderOpen size={16} /> {vd.driveName} ({vd.drivePath})</div>
            <div className="explorer-grid">
                {vd.files?.map((f, i) => (
                    <div key={i} className={`file-item ${f.isSuspicious ? 'suspicious' : ''}`}>
                        <FileText size={32} />
                        <span className="file-name">{f.name}</span>
                        <span className="file-size">{f.size}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AnimatedWifiSelector({ vd }) {
    return (
        <div className="wifi-visual sim-entrance">
            <h3>Available Networks</h3>
            <div className="wifi-list">
                {vd.networks?.map((n, i) => (
                    <div key={i} className={`wifi-item ${n.isSuspicious ? 'suspicious' : ''}`}>
                        <Wifi size={16} />
                        <span>{n.name}</span>
                        {n.isLocked && <Lock size={12} />}
                    </div>
                ))}
            </div>
        </div>
    );
}

function AnimatedSocialFeed({ vd }) {
    return (
        <div className="social-visual sim-entrance">
            {vd.posts?.map((p, i) => (
                <div key={i} className="social-post">
                    <div className="post-header"><div className="avatar">{p.authorAvatar}</div><div><strong>{p.author}</strong><div className="time">{p.timeAgo}</div></div></div>
                    <div className="post-content">{p.content}</div>
                    <div className="post-actions"><span><Heart size={14} /> Like</span><span><MessageCircle size={14} /> Comment</span></div>
                </div>
            ))}
        </div>
    );
}

/* ====================================================
   MAIN PAGE COMPONENT
   ==================================================== */

export default function ScenarioPlay() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const challengeId = searchParams.get('challengeId');
    const navigate = useNavigate();
    const state = useGame();
    const dispatch = useGameDispatch();
    const scenario = scenariosData?.find(s => s.id === id);

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [stepResults, setStepResults] = useState([]);
    const [finished, setFinished] = useState(false);
    const [charReaction, setCharReaction] = useState('idle');
    const [timedOut, setTimedOut] = useState(false);
    const [stepStartTime, setStepStartTime] = useState(0);
    const [timeBonusTotal, setTimeBonusTotal] = useState(0);

    const character = characters[id] || characters['default'] || { name: 'Agent', avatar: '🕵️' };

    useEffect(() => {
        if (scenario && state?.settings) {
            setStepStartTime(Date.now());
            startAmbient(scenario.category);
            speakScenario(scenario.steps[0], state.settings);
        }
        return () => stopAmbient();
    }, [id, scenario, state?.settings]);

    if (!scenario) return <div className="error-page">Scenario not found.</div>;

    const step = scenario.steps[currentStep];
    const totalSteps = scenario.steps.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const handleOptionSelect = (option, index) => {
        if (selectedOption !== null || finished) return;
        setSelectedOption(index);
        setShowFeedback(true);

        const isCorrect = option.isCorrect;
        if (isCorrect) playCorrect(); else playIncorrect();

        const timeTaken = (Date.now() - stepStartTime) / 1000;
        const timeBonus = isCorrect ? Math.max(0, Math.round((scenario.timeLimit || 30) - timeTaken)) : 0;
        setTimeBonusTotal(prev => prev + timeBonus);

        setStepResults([...stepResults, { step: currentStep, isCorrect, timeBonus }]);
        setCharReaction(isCorrect ? 'relief' : 'panic');
    };

    const handleTimeout = () => {
        if (selectedOption !== null || finished) return;
        setTimedOut(true);
        playTimerTimeout();
        handleOptionSelect({ isCorrect: false, feedback: "Time is up! You took too long to make a decision." }, -1);
    };

    const handleContinue = () => {
        setShowFeedback(false);
        let nextIndex = currentStep + 1;

        if (nextIndex < totalSteps) {
            setCurrentStep(nextIndex);
            setSelectedOption(null);
            setCharReaction('idle');
            setStepStartTime(Date.now());
            setTimedOut(false);
            if (state?.settings) {
                speakScenario(scenario.steps[nextIndex], state.settings);
            }
        } else {
            stopAmbient();
            playScenarioComplete();
            const correctCount = [...stepResults].filter(r => r.isCorrect).length;
            const accuracy = Math.round((correctCount / totalSteps) * 100);
            const xpEarned = Math.round(accuracy * 0.5 * scenario.difficulty) + timeBonusTotal;

            if (challengeId) {
                const token = localStorage.getItem('token');
                fetch(buildApiUrl(`/api/challenges/${challengeId}/complete`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ receiverAccuracy: accuracy, receiverXp: xpEarned })
                });
            } else {
                dispatch({ type: 'COMPLETE_SCENARIO', payload: { scenarioId: scenario.id, category: scenario.category, accuracy, xpEarned } });
            }
            setFinished(true);
            setCharReaction(accuracy >= 60 ? 'confident' : 'confused');
        }
    };

    const handleDesktopAction = (action) => {
        let matchedOptionIdx = -1;
        if (action.type === 'delete') {
            matchedOptionIdx = step.options.findIndex(o => o.trigger === 'delete' && o.target === action.fileName);
        } else if (typeof action === 'string') {
            matchedOptionIdx = step.options.findIndex(o => o.trigger === action);
        }
        if (matchedOptionIdx !== -1) handleOptionSelect(step.options[matchedOptionIdx], matchedOptionIdx);
    };

    const renderVisual = () => {
        const vd = step.visualData;
        return (
            <div className="visual-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
                {(() => {
                    switch (step.visualType) {
                        case 'desktop': return <DesktopSim vd={vd} onAction={handleDesktopAction} key={currentStep} />;
                        case 'email': return <AnimatedEmail vd={vd} key={currentStep} />;
                        case 'phone': return <AnimatedPhone vd={vd} key={currentStep} />;
                        case 'chat': return <AnimatedChat vd={vd} key={currentStep} />;
                        case 'popup': return <AnimatedPopup vd={vd} key={currentStep} />;
                        case 'browser': return <AnimatedBrowser vd={vd} key={currentStep} />;
                        case 'file-explorer': return <AnimatedFileExplorer vd={vd} key={currentStep} />;
                        case 'wifi': return <AnimatedWifiSelector vd={vd} key={currentStep} />;
                        case 'social-feed': return <AnimatedSocialFeed vd={vd} key={currentStep} />;
                        default: return <AnimatedDecision prompt={step.prompt} key={currentStep} />;
                    }
                })()}
            </div>
        );
    };

    if (finished) {
        const correctCount = stepResults.filter(r => r.isCorrect).length;
        const accuracy = Math.round((correctCount / totalSteps) * 100);
        const xpEarned = Math.round(accuracy * 0.5 * scenario.difficulty) + timeBonusTotal;
        const grade = accuracy >= 80 ? 'great' : accuracy >= 50 ? 'ok' : 'poor';

        return (
            <div className="scenario-play">
                <Character character={character} reaction={charReaction} />
                <div className="scenario-summary">
                    <div className="summary-card">
                        <div className={`summary-icon ${grade}`}>{grade === 'great' ? <Trophy size={40} /> : <Star size={40} />}</div>
                        <h2 className="summary-title">{grade === 'great' ? 'Excellent Work!' : grade === 'ok' ? 'Good Effort!' : 'Keep Practicing!'}</h2>
                        <div className={`summary-accuracy ${grade}`}>{accuracy}%</div>
                        <div className="summary-stats">
                            <div className="summary-stat"><div className="summary-stat-value" style={{ color: 'var(--success)' }}>{correctCount}</div><div className="summary-stat-label">Correct</div></div>
                            <div className="summary-stat"><div className="summary-stat-value" style={{ color: 'var(--danger)' }}>{totalSteps - correctCount}</div><div className="summary-stat-label">Incorrect</div></div>
                            <div className="summary-stat"><div className="summary-stat-value" style={{ color: 'var(--warning)' }}>+{xpEarned}</div><div className="summary-stat-label">XP</div></div>
                        </div>
                    </div>
                </div>
                <div className="summary-actions">
                    <button className="btn-outline" onClick={() => { setCurrentStep(0); setSelectedOption(null); setStepResults([]); setFinished(false); setTimeBonusTotal(0); }}><RotateCcw size={16} /> Try Again</button>
                    <Link to={challengeId ? "/challenges" : "/scenarios"} className="btn-primary">Continue <ArrowRight size={16} /></Link>
                </div>
            </div>
        );
    }

    return (
        <div className="scenario-play">
            <div className="scenario-play-header">
                <button className="back-link" onClick={() => navigate('/scenarios')}><ArrowLeft size={16} /> Back</button>
                <div className="scenario-play-meta"><span className={`scenario-card-badge ${scenario.category.toLowerCase()}`}>{scenario.category}</span></div>
                <h1>{scenario.title}</h1>
                <div className="scenario-play-progress"><div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div></div>
            </div>
            <Character character={character} reaction={charReaction} />
            <div className="scenario-visual">{renderVisual()}</div>
            <div className="scenario-options">
                <h3>What do you do? {timedOut && <span className="text-danger">(Timed Out)</span>}</h3>
                {step.options.map((option, i) => (
                    <button key={i} className={`option-btn ${selectedOption === i ? (option.isCorrect ? 'selected-correct' : 'selected-incorrect') : ''}`} onClick={() => handleOptionSelect(option, i)} disabled={selectedOption !== null}>{option.text}</button>
                ))}
            </div>
            {showFeedback && selectedOption !== null && (
                <FeedbackModal isCorrect={step.options[selectedOption].isCorrect} feedback={step.options[selectedOption].feedback} defenseTip={step.options[selectedOption].defenseTip} onContinue={handleContinue} />
            )}
        </div>
    );
}
