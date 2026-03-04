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
            <div className="chat-content">
                {messages.slice(0, visibleCount).map((msg, i) => (
                    <div key={i} className="chat-bubble recipient sim-field-reveal">
                        {msg}
                    </div>
                ))}
                {showTyping && (
                    <div className="chat-typing-indicator recipient">
                        <span /> <span /> <span />
                    </div>
                )}
            </div>
        </div>
    );
}

/* Animated Popup — generic modal-style warning */
function AnimatedPopup({ vd }) {
    return (
        <div className={`popup-visual sim-entrance ${vd.isFlashing ? 'popup-flashing' : ''}`}>
            <div className="popup-header">
                <AlertTriangle size={18} /> {vd.title || 'Security Warning'}
            </div>
            <div className="popup-body">
                <p>{vd.message}</p>
                {vd.buttonText && <div className="popup-fake-btn">{vd.buttonText}</div>}
                {vd.phoneNumber && (
                    <div className="popup-phone">
                        Support: <strong>{vd.phoneNumber}</strong>
                    </div>
                )}
            </div>
        </div>
    );
}

/* Base Component for decisions with No Visual */
function AnimatedDecision({ prompt }) {
    return (
        <div className="decision-visual sim-entrance">
            <MessageSquare size={48} className="decision-icon" />
            <div className="decision-prompt-text">{prompt}</div>
        </div>
    );
}

/* Animated Browser — fake browser chrome with URL bar, SSL indicator, page content */
function AnimatedBrowser({ vd }) {
    const [phase, setPhase] = useState(0);
    const [hoveredLink, setHoveredLink] = useState(null);
    const { displayedText: urlText, isTyping: urlTyping } = useTypewriter(
        vd.url || '',
        25,
        800
    );

    useEffect(() => {
        const timers = [
            setTimeout(() => setPhase(1), 400),
            setTimeout(() => setPhase(2), 1200),
            setTimeout(() => setPhase(3), 2500),
            setTimeout(() => setPhase(4), 3500),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    const getFileIcon = (type) => {
        switch (type) {
            case 'pdf': return <FileText size={16} color="#e74c3c" />;
            case 'exe-disguised': return <FileWarning size={16} color="var(--danger)" />;
            default: return <File size={16} />;
        }
    };

    return (
        <div className="browser-visual sim-entrance">
            {/* Tab bar */}
            <div className="browser-tab-bar">
                <div className="browser-tab active">
                    <Globe size={12} />
                    <span>{vd.tabTitle || 'New Tab'}</span>
                    <span className="browser-tab-close">×</span>
                </div>
                <div className="browser-tab-new">+</div>
            </div>

            {/* Address bar */}
            <div className="browser-address-bar">
                <div className="browser-nav-btns">
                    <span className="nav-btn">←</span>
                    <span className="nav-btn">→</span>
                    <span className="nav-btn">↻</span>
                </div>
                <div className={`browser-url-field ${vd.isSecure ? 'secure' : 'insecure'}`}>
                    {vd.isSecure ? (
                        <Lock size={14} className="ssl-icon secure" />
                    ) : (
                        <Unlock size={14} className="ssl-icon insecure" />
                    )}
                    <span className="browser-url-text">
                        {urlText}
                        {urlTyping && <span className="sim-cursor">|</span>}
                    </span>
                </div>
            </div>

            {/* Page content */}
            {phase >= 2 && (
                <div className="browser-page-content sim-field-reveal">
                    {phase >= 2 && (
                        <h2 className="browser-page-title sim-field-reveal">{vd.pageTitle}</h2>
                    )}
                    {phase >= 2 && vd.pageSubtitle && (
                        <p className="browser-page-subtitle sim-field-reveal">{vd.pageSubtitle}</p>
                    )}
                    {phase >= 3 && (
                        <p className="browser-page-text sim-field-reveal">{vd.pageContent}</p>
                    )}

                    {/* Form fields */}
                    {phase >= 4 && vd.formFields && vd.formFields.length > 0 && (
                        <div className="browser-form sim-field-reveal">
                            {vd.formFields.map((field, i) => (
                                <div key={i} className="browser-form-field">
                                    <input type={field === 'Password' ? 'password' : 'text'} placeholder={field} disabled />
                                </div>
                            ))}
                            {vd.submitButton && (
                                <div className="browser-submit-btn sim-btn-appear">{vd.submitButton}</div>
                            )}
                        </div>
                    )}

                    {/* Links with hover-to-reveal */}
                    {phase >= 4 && vd.links && vd.links.length > 0 && (
                        <div className="browser-links sim-field-reveal">
                            {vd.links.map((link, i) => (
                                <span
                                    key={i}
                                    className="browser-page-link"
                                    onMouseEnter={() => setHoveredLink(i)}
                                    onMouseLeave={() => setHoveredLink(null)}
                                >
                                    {link.text}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Hover tooltip showing real URL */}
            {hoveredLink !== null && vd.links[hoveredLink] && (
                <div className="browser-link-tooltip">
                    <span className="tooltip-label">Actual URL:</span>
                    <span className={`tooltip-url ${vd.links[hoveredLink].realUrl.includes('malicious') || vd.links[hoveredLink].realUrl.includes('.ru') ? 'dangerous' : 'safe'}`}>
                        {vd.links[hoveredLink].realUrl}
                    </span>
                </div>
            )}

            {/* SSL Warning banner */}
            {!vd.isSecure && phase >= 1 && (
                <div className="browser-ssl-warning sim-field-reveal">
                    <AlertTriangle size={14} />
                    <span>Not Secure — Connection is not encrypted (HTTP)</span>
                </div>
            )}
        </div>
    );
}

/* Animated File Explorer — Windows-style file explorer with danger highlighting */
function AnimatedFileExplorer({ vd }) {
    const files = vd.files || [];
    const { visibleCount } = useStaggeredReveal(files, 300, 800);
    const [hoveredFile, setHoveredFile] = useState(null);

    const getFileIcon = (file) => {
        switch (file.type) {
            case 'folder': return <FolderOpen size={20} color="#f39c12" />;
            case 'pdf': return <FileText size={20} color="#e74c3c" />;
            case 'exe-disguised': return <FileWarning size={20} color="var(--danger)" className="flicker" />;
            case 'bat': return <FileWarning size={20} color="var(--warning)" />;
            case 'sys': return <Shield size={20} color="var(--warning)" />;
            case 'xlsx': return <FileText size={20} color="#27ae60" />;
            case 'docx': return <FileText size={20} color="#2980b9" />;
            case 'txt': return <FileText size={20} color="var(--text-muted)" />;
            default: return <File size={20} />;
        }
    };

    return (
        <div className="file-explorer-visual sim-entrance">
            {/* Title bar */}
            <div className="fe-titlebar">
                <span className="email-dot red" />
                <span className="email-dot yellow" />
                <span className="email-dot green" />
                <span className="fe-titlebar-text">File Explorer — {vd.driveName}</span>
            </div>

            {/* Breadcrumb */}
            <div className="fe-breadcrumb">
                <HardDrive size={14} />
                <ChevronRight size={12} />
                <span>{vd.driveName}</span>
                <ChevronRight size={12} />
                <span className="fe-crumb-active">{vd.drivePath}</span>
            </div>

            {/* File list */}
            <div className="fe-content">
                <div className="fe-sidebar">
                    <div className="fe-sidebar-item"><HardDrive size={14} /> OS (C:)</div>
                    <div className="fe-sidebar-item active"><HardDrive size={14} /> {vd.driveName.split(' ')[0]}</div>
                    <div className="fe-sidebar-item"><FolderOpen size={14} /> Documents</div>
                    <div className="fe-sidebar-item"><Image size={14} /> Pictures</div>
                </div>

                <div className="fe-file-list">
                    {/* Column headers */}
                    <div className="fe-file-header">
                        <span className="fe-col-name">Name</span>
                        <span className="fe-col-date">Date Modified</span>
                        <span className="fe-col-size">Size</span>
                    </div>

                    {files.slice(0, visibleCount).map((file, i) => (
                        <div
                            key={i}
                            className={`fe-file-row sim-field-reveal ${!file.isSafe ? 'fe-file-danger' : ''}`}
                            onMouseEnter={() => setHoveredFile(i)}
                            onMouseLeave={() => setHoveredFile(null)}
                        >
                            <span className="fe-col-name">
                                {getFileIcon(file)}
                                <span className={!file.isSafe ? 'fe-name-suspicious' : ''}>{file.name}</span>
                                {!file.isSafe && <AlertTriangle size={12} className="fe-danger-icon" />}
                            </span>
                            <span className="fe-col-date">{file.date}</span>
                            <span className="fe-col-size">{file.size}</span>

                            {/* Tooltip on hover */}
                            {hoveredFile === i && file.tooltip && (
                                <div className="fe-file-tooltip">
                                    <AlertTriangle size={12} />
                                    <div>
                                        <div className="fe-tooltip-type">Type: {file.realType}</div>
                                        <div className="fe-tooltip-warning">{file.tooltip}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Status bar */}
            <div className="fe-statusbar">
                <span>{files.length} items</span>
                <span>{vd.driveUsed} used of {vd.driveSize}</span>
            </div>
        </div>
    );
}

/* Animated Wi-Fi Selector — OS-style network list with signal bars */
function AnimatedWifiSelector({ vd }) {
    const networks = vd.networks || [];
    const { visibleCount } = useStaggeredReveal(networks, 500, 600);
    const [scanning, setScanning] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setScanning(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const renderSignalBars = (strength) => {
        return (
            <div className="wifi-signal-bars">
                {[1, 2, 3, 4, 5].map(level => (
                    <div
                        key={level}
                        className={`wifi-bar ${level <= strength ? 'active' : ''}`}
                        style={{ height: `${4 + level * 3}px` }}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="wifi-visual sim-entrance">
            {/* Header */}
            <div className="wifi-header">
                <Wifi size={20} />
                <div>
                    <div className="wifi-header-title">Wi-Fi Networks</div>
                    <div className="wifi-header-location">{vd.location}</div>
                </div>
            </div>

            {/* Scanning indicator */}
            {scanning && (
                <div className="wifi-scanning">
                    <div className="wifi-scanning-spinner" />
                    <span>Scanning for networks...</span>
                </div>
            )}

            {/* Network list */}
            <div className="wifi-network-list">
                {networks.slice(0, visibleCount).map((network, i) => (
                    <div
                        key={i}
                        className={`wifi-network-item sim-field-reveal ${network.isEvil ? 'wifi-evil' : ''} ${network.connected ? 'wifi-connected' : ''}`}
                    >
                        <div className="wifi-network-info">
                            <div className="wifi-network-name">
                                {network.secured ? (
                                    <Lock size={14} className="wifi-lock" />
                                ) : (
                                    <Unlock size={14} className="wifi-unlock" />
                                )}
                                {network.name}
                            </div>
                            <div className="wifi-network-hint">{network.hint}</div>
                        </div>
                        <div className="wifi-network-signal">
                            {renderSignalBars(network.signal)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer hint */}
            <div className="wifi-footer">
                <Shield size={14} />
                <span>Tip: Networks with 🔒 are encrypted. Open networks can be intercepted.</span>
            </div>
        </div>
    );
}

/* Animated Social Feed — LinkedIn-style social media posts */
function AnimatedSocialFeed({ vd }) {
    const posts = vd.posts || [];
    const { visibleCount } = useStaggeredReveal(posts, 800, 500);

    return (
        <div className="social-feed-visual sim-entrance">
            {/* Platform Header */}
            <div className="sf-header">
                <Briefcase size={16} />
                <span className="sf-platform-name">{vd.platform}</span>
            </div>

            {/* Posts */}
            <div className="sf-posts">
                {posts.slice(0, visibleCount).map((post, i) => (
                    <div key={i} className={`sf-post sim-field-reveal ${post.isSuspicious ? 'sf-post-suspicious' : ''}`}>
                        {/* Author header */}
                        <div className="sf-post-header">
                            <div className="sf-avatar">{post.authorAvatar}</div>
                            <div className="sf-author-info">
                                <div className="sf-author-name">
                                    {post.author}
                                    {post.verified && <CheckCircle size={14} className="sf-verified" />}
                                    {!post.verified && <span className="sf-unverified">✗</span>}
                                </div>
                                <div className="sf-author-title">{post.authorTitle}</div>
                            </div>
                            <span className="sf-time">{post.timeAgo}</span>
                        </div>

                        {/* Post content */}
                        <div className="sf-post-content">{post.content}</div>

                        {/* Attachment if present */}
                        {post.attachment && (
                            <div className="sf-attachment">
                                <Paperclip size={14} />
                                <span className={`sf-attachment-name ${post.attachment.type === 'exe' ? 'sf-attachment-danger' : ''}`}>
                                    {post.attachment.name}
                                </span>
                                <span className="sf-attachment-size">{post.attachment.size}</span>
                                {post.attachment.type === 'exe' && <AlertTriangle size={12} className="sf-attachment-warn" />}
                            </div>
                        )}

                        {/* Engagement bar */}
                        <div className="sf-engagement">
                            <span><Heart size={14} /> {post.likes}</span>
                            <span><MessageCircle size={14} /> {post.comments}</span>
                            <span><Share2 size={14} /> {post.shares}</span>
                        </div>

                        {/* Suspicious badge */}
                        {post.isSuspicious && post.suspiciousReasons.length > 0 && (
                            <div className="sf-suspicious-hint">
                                <AlertTriangle size={12} />
                                <span>⚠ Potential red flags detected</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
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
    const scenario = scenariosData.find(s => s.id === id);

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [stepResults, setStepResults] = useState([]);
    const [finished, setFinished] = useState(false);
    const [charReaction, setCharReaction] = useState('idle');

    // Timer and performance
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
    }, [currentStep, showFeedback, finished]);

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

    const handleDesktopAction = (action) => {
        // Find matching option based on action type or payload
        let matchedOptionIdx = -1;

        if (action.type === 'delete') {
            matchedOptionIdx = step.options.findIndex(o => o.trigger === 'delete' && o.target === action.fileName);
        } else if (typeof action === 'string') {
            // Close window or other named action
            matchedOptionIdx = step.options.findIndex(o => o.trigger === action);
        }

        if (matchedOptionIdx !== -1) {
            handleOptionSelect(step.options[matchedOptionIdx], matchedOptionIdx);
        }
    };

    // Render visual based on type
    const renderVisual = () => {
        const vd = step.visualData;

        switch (step.visualType) {
            case 'desktop':
                return <DesktopSim vd={vd} onAction={handleDesktopAction} key={`desktop-${currentStep}`} />;

            case 'email':
                return <AnimatedEmail vd={vd} key={`email-${currentStep}`} />;

            case 'phone':
                return <AnimatedPhone vd={vd} key={`phone-${currentStep}`} />;

            case 'chat':
                return <AnimatedChat vd={vd} key={`chat-${currentStep}`} />;

            case 'popup':
                return <AnimatedPopup vd={vd} key={`popup-${currentStep}`} />;

            case 'browser':
                return <AnimatedBrowser vd={vd} key={`browser-${currentStep}`} />;

            case 'file-explorer':
                return <AnimatedFileExplorer vd={vd} key={`file-explorer-${currentStep}`} />;

            case 'wifi':
                return <AnimatedWifiSelector vd={vd} key={`wifi-${currentStep}`} />;

            case 'social-feed':
                return <AnimatedSocialFeed vd={vd} key={`social-feed-${currentStep}`} />;

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
