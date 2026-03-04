import { useState, useRef, useEffect } from 'react';
import { useGame, useGameDispatch } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Terminal, Lock, ArrowRight, RotateCcw, ChevronRight, Trophy, Star } from 'lucide-react';
import terminalChallenges from '../data/terminalChallenges';
import { getRank } from '../utils/ranks';
import './TerminalChallenge.css';

export default function TerminalChallenge() {
    const { user } = useAuth();
    const gameState = useGame();
    const dispatch = useGameDispatch();

    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([]);
    const [finished, setFinished] = useState(false);
    const [wrongAttempts, setWrongAttempts] = useState(0);

    const inputRef = useRef(null);
    const terminalRef = useRef(null);

    // Auto-scroll terminal
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [history]);

    // Auto-focus input
    useEffect(() => {
        if (selectedChallenge && inputRef.current) {
            inputRef.current.focus();
        }
    }, [selectedChallenge, currentStep]);

    // Show challenge prompt when starting or advancing
    useEffect(() => {
        if (selectedChallenge && !finished) {
            const step = selectedChallenge.steps[currentStep];
            setHistory(prev => [
                ...prev,
                { type: 'system', text: step.prompt }
            ]);
        }
    }, [selectedChallenge?.id, currentStep]);

    if (!user) {
        return (
            <div className="terminal-page">
                <div className="terminal-locked">
                    <Lock size={64} />
                    <h2>Terminal Access Denied</h2>
                    <p>You need an active agent account to access the Interactive Terminal.</p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <Link to="/login" className="btn-primary">Log In</Link>
                        <Link to="/signup" className="btn-secondary" style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', borderRadius: 'var(--radius-md)' }}>Sign Up</Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleCommand = (e) => {
        e.preventDefault();
        const cmd = input.trim();
        if (!cmd || !selectedChallenge) return;

        const step = selectedChallenge.steps[currentStep];

        // Add user input to history
        setHistory(prev => [...prev, { type: 'input', text: cmd }]);
        setInput('');

        // Check for help command
        if (cmd.toLowerCase() === 'help' || cmd.toLowerCase() === 'hint') {
            setHistory(prev => [...prev, { type: 'hint', text: `💡 Hint: ${step.hint}` }]);
            return;
        }

        // Check for clear command
        if (cmd.toLowerCase() === 'clear') {
            setHistory([{ type: 'system', text: step.prompt }]);
            return;
        }

        // Check if command matches expected
        const isCorrect = step.expectedCommands.some(
            expected => cmd.toLowerCase().includes(expected.toLowerCase())
        );

        if (isCorrect) {
            setWrongAttempts(0);
            // Show output
            setHistory(prev => [
                ...prev,
                { type: 'output', text: step.output },
                { type: 'success', text: step.successMessage }
            ]);

            // Move to next step or finish
            setTimeout(() => {
                if (currentStep < selectedChallenge.steps.length - 1) {
                    setCurrentStep(prev => prev + 1);
                } else {
                    // Challenge complete!
                    const xpEarned = selectedChallenge.xpReward;
                    dispatch({
                        type: 'COMPLETE_SCENARIO',
                        payload: {
                            scenarioId: selectedChallenge.id,
                            category: 'Terminal',
                            accuracy: 100,
                            xpEarned
                        }
                    });
                    setFinished(true);
                    setHistory(prev => [
                        ...prev,
                        { type: 'success', text: `\n🎯 CHALLENGE COMPLETE! +${xpEarned} XP earned!\nType 'exit' to return to challenge list.` }
                    ]);
                }
            }, 1500);
        } else {
            setWrongAttempts(prev => prev + 1);
            const attempts = wrongAttempts + 1;
            if (attempts >= 3) {
                setHistory(prev => [
                    ...prev,
                    { type: 'error', text: `Command not recognized. Try: ${step.expectedCommands[0]}` }
                ]);
            } else if (attempts >= 2) {
                setHistory(prev => [
                    ...prev,
                    { type: 'error', text: `Command not recognized. Type 'hint' for help.` }
                ]);
            } else {
                setHistory(prev => [
                    ...prev,
                    { type: 'error', text: `bash: ${cmd}: command not recognized or incorrect syntax` }
                ]);
            }
        }
    };

    const handleReset = () => {
        setSelectedChallenge(null);
        setCurrentStep(0);
        setHistory([]);
        setFinished(false);
        setInput('');
        setWrongAttempts(0);
    };

    // Challenge selection screen
    if (!selectedChallenge) {
        return (
            <div className="terminal-page">
                <div className="terminal-header">
                    <Terminal size={32} className="terminal-icon" />
                    <h1>Interactive Terminal</h1>
                    <p>Practice real cybersecurity commands in simulated incident response scenarios</p>
                </div>

                <div className="challenge-grid">
                    {terminalChallenges.map(challenge => (
                        <div
                            key={challenge.id}
                            className="challenge-card"
                            onClick={() => setSelectedChallenge(challenge)}
                        >
                            <div className="challenge-card-header">
                                <Terminal size={20} />
                                <span className="challenge-difficulty">
                                    {'⬤'.repeat(challenge.difficulty)}{'○'.repeat(3 - challenge.difficulty)}
                                </span>
                            </div>
                            <h3>{challenge.title}</h3>
                            <p>{challenge.description}</p>
                            <div className="challenge-card-footer">
                                <span className="challenge-xp">+{challenge.xpReward} XP</span>
                                <span className="challenge-steps">{challenge.steps.length} steps</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Terminal interface
    return (
        <div className="terminal-page">
            <div className="terminal-window">
                <div className="terminal-title-bar">
                    <div className="terminal-dots">
                        <span className="dot red" />
                        <span className="dot yellow" />
                        <span className="dot green" />
                    </div>
                    <div className="terminal-title">
                        {getRank(gameState.level).icon} agent@securitysim — {selectedChallenge.title}
                    </div>
                    <div className="terminal-step-badge">
                        Step {currentStep + 1}/{selectedChallenge.steps.length}
                    </div>
                </div>

                <div className="terminal-body" ref={terminalRef} onClick={() => inputRef.current?.focus()}>
                    <div className="terminal-welcome">
                        {`╔══════════════════════════════════════════╗
║   SecuritySim Interactive Terminal v2.0   ║
║   Type 'hint' for help, 'clear' to reset  ║
╚══════════════════════════════════════════╝`}
                    </div>

                    {history.map((entry, i) => (
                        <div key={i} className={`terminal-line ${entry.type}`}>
                            {entry.type === 'input' && (
                                <span className="terminal-prompt">
                                    <span className="prompt-user">agent</span>
                                    <span className="prompt-at">@</span>
                                    <span className="prompt-host">securitysim</span>
                                    <span className="prompt-dollar">$ </span>
                                </span>
                            )}
                            <span className="terminal-text">{entry.text}</span>
                        </div>
                    ))}

                    {!finished && (
                        <form onSubmit={handleCommand} className="terminal-input-line">
                            <span className="terminal-prompt">
                                <span className="prompt-user">agent</span>
                                <span className="prompt-at">@</span>
                                <span className="prompt-host">securitysim</span>
                                <span className="prompt-dollar">$ </span>
                            </span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                className="terminal-input"
                                spellCheck={false}
                                autoComplete="off"
                            />
                        </form>
                    )}

                    {finished && (
                        <div className="terminal-complete">
                            <div className="complete-badge">
                                <Trophy size={40} />
                            </div>
                            <h2>Mission Complete!</h2>
                            <p>+{selectedChallenge.xpReward} XP Earned</p>
                            <div className="complete-actions">
                                <button className="btn-outline" onClick={handleReset}>
                                    <RotateCcw size={16} /> Back to Challenges
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
