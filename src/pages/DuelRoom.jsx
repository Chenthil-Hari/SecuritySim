import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Swords, Shield, Trophy, Activity, ArrowLeft, Terminal, Cpu, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { interactiveScenarios } from '../data/interactiveScenarios';
import { buildApiUrl } from '../utils/api';
import './DuelRoom.css';

export default function DuelRoom() {
    const { matchId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [match, setMatch] = useState(null);
    const [scenario, setScenario] = useState(null);
    const [socket, setSocket] = useState(null);
    
    // Player State
    const [currentNodeId, setCurrentNodeId] = useState("start");
    const [history, setHistory] = useState([]);
    const [displayedText, setDisplayedText] = useState("");
    const [typing, setTyping] = useState(false);
    const [currentScore, setCurrentScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // Opponent State
    const [opponentProgress, setOpponentProgress] = useState({
        score: 0,
        isFinished: false,
        username: 'Opponent'
    });

    const bottomRef = useRef(null);

    // Initial Fetch & Socket Setup
    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl(`/api/pvp/${matchId}`), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setMatch(data);
                    const foundScen = interactiveScenarios.find(s => s.id === data.scenarioId);
                    setScenario(foundScen);
                    
                    const opp = data.players.find(p => p._id !== user.id);
                    if (opp) setOpponentProgress(prev => ({ ...prev, username: opp.username }));
                }
            } catch (err) {
                console.error("Match fetch failed:", err);
            }
        };

        fetchMatch();

        const newSocket = io(window.location.origin);
        setSocket(newSocket);
        newSocket.emit('identify', user.id);
        newSocket.emit('join_duel', matchId);

        newSocket.on('opponent_score_update', (data) => {
            if (data.userId !== user.id) {
                setOpponentProgress(prev => ({
                    ...prev,
                    score: data.score
                }));
            }
        });

        newSocket.on('opponent_finished', (data) => {
            if (data.userId !== user.id) {
                setOpponentProgress(prev => ({
                    ...prev,
                    isFinished: true,
                    score: data.finalScore
                }));
            }
        });

        return () => newSocket.close();
    }, [matchId, user.id]);

    // Typewriter effect (same as Simulator)
    useEffect(() => {
        if (!scenario || !currentNodeId) return;
        const node = scenario.nodes[currentNodeId];
        if (!node) return;

        setTyping(true);
        setDisplayedText("");
        let currentIndex = 0;
        const intervalId = setInterval(() => {
            if (currentIndex < node.text.length) {
                setDisplayedText(node.text.substring(0, currentIndex + 1));
                currentIndex++;
                if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
            } else {
                clearInterval(intervalId);
                setTyping(false);
            }
        }, 15);

        return () => clearInterval(intervalId);
    }, [currentNodeId, scenario]);

    const handleOptionClick = (option) => {
        if (typing || isFinished) return;

        const node = scenario.nodes[currentNodeId];
        const nextPoints = option.points || 0;
        const newScore = currentScore + nextPoints;
        
        setCurrentScore(newScore);
        setHistory(prev => [...prev, {
            question: node.text,
            choice: option.text,
            points: nextPoints
        }]);

        // Sync with opponent
        if (socket) {
            socket.emit('duel_score_update', {
                matchId,
                userId: user.id,
                score: newScore,
                currentNodeId: option.nextNodeId
            });
        }

        const nextNode = scenario.nodes[option.nextNodeId];
        if (nextNode && nextNode.options.length === 0) {
            // It's a terminal node
            const finalScore = newScore + (nextNode.score || 0);
            handleFinish(finalScore);
        } else {
            setCurrentNodeId(option.nextNodeId);
        }
    };

    const handleFinish = (finalScore) => {
        setIsFinished(true);
        setCurrentScore(finalScore);
        if (socket) {
            socket.emit('duel_finish', {
                matchId,
                userId: user.id,
                finalScore: finalScore
            });
        }
    };

    if (!scenario || !match) return <div className="loading-screen">Establishing Secure Duel Connection...</div>;

    const currentNode = scenario.nodes[currentNodeId];
    const opponent = match.players.find(p => p._id !== user.id);

    return (
        <div className="duel-room-layout">
            <header className="duel-header">
                <button className="exit-btn" onClick={() => navigate('/interactive-scenarios')}>
                    <ArrowLeft size={18} /> Abort Duel
                </button>
                <div className="duel-info">
                    <Swords className="duel-icon" />
                    <h1>LIVE DUEL: {scenario.title}</h1>
                </div>
                <div className="match-status">
                   <div className="status-pill pulse">
                       <Activity size={14} /> ACTIVE DUEL
                   </div>
                </div>
            </header>

            <div className="duel-main">
                {/* Left: Your Terminal */}
                <div className="player-pane own-pane">
                    <div className="pane-header">
                        <div className="player-badge">
                            <Shield size={16} /> YOU ({user.username})
                        </div>
                        <div className="score-display">
                            SCORE: {currentScore}
                        </div>
                    </div>

                    <div className="duel-terminal">
                        <div className="term-body">
                            {history.map((log, i) => (
                                <div key={i} className="log-entry">
                                    <div className="prompt">$ sys_read</div>
                                    <p className="txt-prev">{log.question}</p>
                                    <div className="prompt">$ user_in</div>
                                    <p className="txt-choice">{`> ${log.choice}`}</p>
                                </div>
                            ))}
                            <div className="active-entry">
                                <div className="prompt">$ sys_read --live</div>
                                <p className="txt-current">
                                    {displayedText}
                                    {typing && <span className="cursor">_</span>}
                                </p>
                            </div>
                            <div ref={bottomRef} style={{ height: '20px' }} />
                        </div>
                    </div>

                    <div className="duel-controls">
                        {!typing && !isFinished && currentNode?.options.map((opt, i) => (
                            <button key={i} className="duel-opt-btn" onClick={() => handleOptionClick(opt)}>
                                <span className="opt-idx">{i+1}</span>
                                <span className="opt-txt">{opt.text}</span>
                            </button>
                        ))}
                        {isFinished && (
                            <div className="finish-wait">
                                <CheckCircle2 size={32} color="#00ff88" />
                                <h3>Transmission Complete</h3>
                                <p>Waiting for opponent to finalize report...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Opponent Tracking */}
                <div className="player-pane opponent-pane">
                    <div className="pane-header">
                        <div className="player-badge opp">
                            <Shield size={16} /> OPPONENT ({opponentProgress.username})
                        </div>
                        <div className="score-display">
                            SCORE: {opponentProgress.score}
                        </div>
                    </div>

                    <div className="opponent-visualizer">
                        <div className="opp-status-icon">
                            {opponentProgress.isFinished ? <CheckCircle2 size={64} color="#00ff88" /> : <Activity size={64} className="pulse-slow" />}
                        </div>
                        <div className="opp-meta">
                            <h3>{opponentProgress.isFinished ? "FINISHED" : "OPERATING..."}</h3>
                            <div className="progress-bar-container">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${(opponentProgress.score / scenario.maxScore) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        
                        {isFinished && opponentProgress.isFinished && (
                            <div className="final-result-card animate-pop">
                                <Trophy size={48} className="gold-glow" />
                                <h2>{currentScore > opponentProgress.score ? "VICTORY" : currentScore < opponentProgress.score ? "DEFEAT" : "DRAW"}</h2>
                                <div className="final-scores">
                                    <div>YOU: {currentScore}</div>
                                    <div>THEM: {opponentProgress.score}</div>
                                </div>
                                <button className="return-btn" onClick={() => navigate('/interactive-scenarios')}>
                                    Return to Catalog
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
