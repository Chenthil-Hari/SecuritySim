import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { buildApiUrl } from '../utils/api';
import { Swords, Check, X, ShieldAlert, History, UserSearch, Send, Play } from 'lucide-react';
import Loader from '../components/Loader';
import scenariosData from '../data/scenarios';
import './Challenges.css';

export default function Challenges() {
    const { user } = useAuth();
    const { completedScenarios } = useGame();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [challenges, setChallenges] = useState({ incoming: [], outgoing: [], history: [] });
    const [error, setError] = useState(null);

    // New Challenge Form State
    const [showNewChallenge, setShowNewChallenge] = useState(false);
    const [opponentUsername, setOpponentUsername] = useState('');
    const [selectedScenario, setSelectedScenario] = useState('');
    const [challengeStatusMsg, setChallengeStatusMsg] = useState(null);

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/challenges'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setChallenges(data);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to load challenges.');
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async (challengeId) => {
        if (!window.confirm("Decline this challenge?")) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(buildApiUrl(`/api/challenges/${challengeId}/decline`), {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchChallenges();
        } catch (err) {
            console.error("Error declining challenge", err);
        }
    };

    const handleCancel = async (challengeId) => {
        if (!window.confirm("Cancel this challenge?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl(`/api/challenges/${challengeId}/cancel`), {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchChallenges();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to cancel challenge");
            }
        } catch (err) {
            console.error("Error cancelling challenge", err);
        }
    };

    const handleAccept = (challenge) => {
        // Navigate to scenario play with a query param signaling it's a challenge mode
        navigate(`/scenarios/${challenge.scenarioId}?challengeId=${challenge._id}`);
    };

    const handleSendChallenge = async (e) => {
        e.preventDefault();
        setChallengeStatusMsg(null);

        if (!opponentUsername || !selectedScenario) return;

        const scenarioLogs = (completedScenarios || []).filter(s => s.scenarioId === selectedScenario);
        if (scenarioLogs.length === 0) {
            setChallengeStatusMsg({ type: 'error', text: 'You must complete a scenario first before challenging someone else to it!' });
            return;
        }

        const bestAttempt = scenarioLogs.reduce((best, curr) => curr.accuracy > best.accuracy ? curr : best, scenarioLogs[0]);
        const matchedScenario = scenariosData.find(s => s.id === selectedScenario);
        const bestXp = Math.round(bestAttempt.accuracy * 0.5 * matchedScenario.difficulty);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/challenges/create'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiverUsername: opponentUsername,
                    scenarioId: selectedScenario,
                    senderAccuracy: bestAttempt.accuracy,
                    senderXp: bestXp
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setChallengeStatusMsg({ type: 'success', text: `Challenge sent to ${opponentUsername}!` });
            setShowNewChallenge(false);
            setOpponentUsername('');
            setSelectedScenario('');
            fetchChallenges();

        } catch (err) {
            setChallengeStatusMsg({ type: 'error', text: err.name === 'AbortError' ? 'Request timed out' : err.message });
        }
    };

    const getScenarioName = (id) => {
        const scenario = scenariosData.find(s => s.id === id);
        return scenario ? scenario.title : id;
    };

    if (loading) return <div className="page-loader"><Loader /></div>;

    return (
        <div className="challenges-page">
            <header className="challenges-header">
                <div className="title-row">
                    <div className="title-left">
                        <Swords size={32} className="text-primary" />
                        <h1>PvP Challenges</h1>
                    </div>
                    <button className="btn-primary" onClick={() => setShowNewChallenge(!showNewChallenge)}>
                        {showNewChallenge ? 'Cancel' : 'New Challenge'}
                    </button>
                </div>
                <p>Test your skills against fellow agents. Challenge a friend to beat your best score on any scenario.</p>
            </header>

            {challengeStatusMsg && (
                <div className={`alert ${challengeStatusMsg.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                    {challengeStatusMsg.text}
                </div>
            )}

            {error && <div className="alert alert-error">{error}</div>}

            {showNewChallenge && (
                <div className="new-challenge-card card">
                    <h2><UserSearch size={20} /> Deploy a Challenge</h2>
                    <form onSubmit={handleSendChallenge} className="challenge-form">
                        <div className="form-group">
                            <label>Opponent Username</label>
                            <input
                                type="text"
                                value={opponentUsername}
                                onChange={(e) => setOpponentUsername(e.target.value)}
                                placeholder="e.g. Neo"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Select Scenario to Challenge</label>
                            <select
                                value={selectedScenario}
                                onChange={(e) => setSelectedScenario(e.target.value)}
                                required
                            >
                                <option value="" disabled>-- Choose a Scenario --</option>
                                {scenariosData.map(s => (
                                    <option key={s.id} value={s.id}>{s.title} (Diff: {s.difficulty})</option>
                                ))}
                            </select>
                            <small className="form-note">You will send your personal best score for this scenario as the target to beat.</small>
                        </div>
                        <button type="submit" className="btn-primary w-full"><Send size={16} /> Send Challenge</button>
                    </form>
                </div>
            )}

            <div className="challenges-grid">
                <div className="challenge-column">
                    <h2><ShieldAlert size={20} className="text-warning" /> Incoming Directives</h2>
                    {challenges.incoming?.length === 0 ? (
                        <p className="empty-state">No incoming challenges at this time.</p>
                    ) : (
                        <ul className="challenge-list">
                            {challenges.incoming.map(c => (
                                <li key={c._id} className="challenge-item incoming-call">
                                    <div className="challenge-meta">
                                        <h4>{c.senderId.username} challenged you!</h4>
                                        <p className="scenario-name">Op: {getScenarioName(c.scenarioId)}</p>
                                        <div className="target-score">Target to beat: <strong>{c.senderAccuracy}%</strong></div>
                                    </div>
                                    <div className="challenge-actions">
                                        <button className="btn-icon btn-success" onClick={() => handleAccept(c)} title="Accept & Play">
                                            <Play size={18} />
                                        </button>
                                        <button className="btn-icon btn-danger" onClick={() => handleDecline(c._id)} title="Decline">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="challenge-column">
                    <h2><Send size={20} className="text-primary" /> Sent Directives</h2>
                    {challenges.outgoing?.length === 0 ? (
                        <p className="empty-state">No pending challenges sent.</p>
                    ) : (
                        <ul className="challenge-list">
                            {challenges.outgoing.map(c => (
                                <li key={c._id} className="challenge-item outgoing-call">
                                    <div className="challenge-meta">
                                        <h4>Awaiting {c.receiverId?.username || 'Unknown Agent'}</h4>
                                        <p className="scenario-name">Op: {getScenarioName(c.scenarioId)}</p>
                                        <div className="target-score">Your score: <strong>{c.senderAccuracy}%</strong></div>
                                    </div>
                                    <div className="challenge-actions">
                                        <div className="status-badge pending">Pending</div>
                                        <button className="btn-icon btn-danger" onClick={() => handleCancel(c._id)} title="Cancel Challenge">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="challenge-history">
                <h2><History size={20} /> Combat Log</h2>
                {challenges.history?.length === 0 ? (
                    <p className="empty-state">No challenges completed yet.</p>
                ) : (
                    <ul className="history-list">
                        {challenges.history.map(c => {
                            const isSender = c.senderId._id === user?.id;
                            const opponentName = isSender ? (c.receiverId?.username || 'Unknown') : (c.senderId?.username || 'Unknown');

                            let resolution = "Tie";
                            let resolutionClass = "tie";

                            if (c.status === 'declined') {
                                resolution = "Declined";
                                resolutionClass = "declined";
                            } else if (c.status === 'cancelled') {
                                resolution = "Cancelled";
                                resolutionClass = "declined";
                            } else if (c.status === 'completed') {
                                if (isSender) {
                                    resolution = c.senderAccuracy > c.receiverAccuracy ? "Victory" : (c.senderAccuracy < c.receiverAccuracy ? "Defeat" : "Tie");
                                } else {
                                    resolution = c.receiverAccuracy > c.senderAccuracy ? "Victory" : (c.receiverAccuracy < c.senderAccuracy ? "Defeat" : "Tie");
                                }
                                resolutionClass = resolution.toLowerCase();
                            }

                            return (
                                <li key={c._id} className={`history-item result-${resolutionClass}`}>
                                    <div className="history-left">
                                        <span className={`result-indicator ${resolutionClass}`}>{resolution}</span>
                                        <div className="history-details">
                                            <strong>{isSender ? `You vs ${opponentName}` : `${opponentName} vs You`}</strong>
                                            <span>{getScenarioName(c.scenarioId)}</span>
                                        </div>
                                    </div>
                                    <div className="history-scores">
                                        {c.status === 'completed' ? (
                                            <>
                                                <div className="score-block">
                                                    <small>{isSender ? 'You' : opponentName}</small>
                                                    <span>{c.senderAccuracy}%</span>
                                                </div>
                                                <span className="vs">vs</span>
                                                <div className="score-block">
                                                    <small>{isSender ? opponentName : 'You'}</small>
                                                    <span>{c.receiverAccuracy}%</span>
                                                </div>
                                            </>
                                        ) : (
                                            <span className="declined-text">
                                                {c.status === 'cancelled' ? 'Retracted' : 'Declined'}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
