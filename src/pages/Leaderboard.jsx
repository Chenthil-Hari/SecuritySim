import { useState, useEffect } from 'react';
import { leaderboardAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { Trophy, Medal, Shield, User, Crown } from 'lucide-react';
import './Leaderboard.css';

export default function Leaderboard() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const gameState = useGame();

    useEffect(() => {
        if (user) {
            loadLeaderboard();
        }
    }, [user]);

    const loadLeaderboard = async () => {
        setLoading(true);
        setError('');

        try {
            // Step 1: Write current user's score to the backend
            const displayName = user.displayName || user.email?.split('@')[0] || 'Anonymous';
            await leaderboardAPI.upsert({
                displayName: displayName,
                photoURL: user.photoURL || null,
                score: gameState.score,
                level: gameState.level,
                xp: gameState.xp,
                scenariosCompleted: gameState.completedScenarios.length,
                badgesCount: gameState.badges.length
            });

            // Step 2: Fetch all leaderboard entries
            const { players: data } = await leaderboardAPI.getAll();
            setPlayers(data);
        } catch (err) {
            console.error('Leaderboard error:', err);
            setError(err.message || 'Failed to load leaderboard.');

            // Fallback: show current user from local data
            setPlayers([{
                id: user._id,
                rank: 1,
                displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
                photoURL: user.photoURL || null,
                score: gameState.score,
                level: gameState.level,
                xp: gameState.xp,
                scenariosCompleted: gameState.completedScenarios.length,
                badgesCount: gameState.badges.length
            }]);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown size={22} className="rank-icon gold" />;
        if (rank === 2) return <Medal size={22} className="rank-icon silver" />;
        if (rank === 3) return <Medal size={22} className="rank-icon bronze" />;
        return <span className="rank-number">{rank}</span>;
    };

    const getRankClass = (rank) => {
        if (rank === 1) return 'rank-gold';
        if (rank === 2) return 'rank-silver';
        if (rank === 3) return 'rank-bronze';
        return '';
    };

    if (loading) {
        return (
            <div className="leaderboard-page">
                <div className="leaderboard-loading">
                    <Trophy size={48} />
                    <p>Loading rankings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="leaderboard-page">
            <div className="leaderboard-header">
                <div className="leaderboard-title">
                    <Trophy size={32} />
                    <div>
                        <h1>Leaderboard</h1>
                        <p>Top cyber defenders ranked by safety score</p>
                    </div>
                </div>
                <button className="btn-outline refresh-btn" onClick={loadLeaderboard}>
                    Refresh
                </button>
            </div>

            {error && (
                <div className="leaderboard-error">
                    <p>⚠️ {error}</p>
                </div>
            )}

            {players.length > 0 ? (
                <>
                    {/* Top 3 Podium */}
                    <div className="podium">
                        {players.slice(0, 3).map((player) => (
                            <div key={player.id} className={`podium-card ${getRankClass(player.rank)} ${player.id === user?._id ? 'is-you' : ''}`}>
                                <div className="podium-rank">{getRankIcon(player.rank)}</div>
                                <div className="podium-avatar">
                                    {player.photoURL ? (
                                        <img src={player.photoURL} alt={player.displayName} />
                                    ) : (
                                        <User size={28} />
                                    )}
                                </div>
                                <h3 className="podium-name">{player.displayName}</h3>
                                <div className="podium-score">
                                    <Shield size={16} />
                                    <span>{player.score}/100</span>
                                </div>
                                <div className="podium-stats">
                                    <span>Lvl {player.level}</span>
                                    <span>•</span>
                                    <span>{player.xp} XP</span>
                                </div>
                                {player.id === user?._id && <div className="you-badge">You</div>}
                            </div>
                        ))}
                    </div>

                    {/* Full Table */}
                    <div className="leaderboard-table-container">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Player</th>
                                    <th>Score</th>
                                    <th>Level</th>
                                    <th>XP</th>
                                    <th>Scenarios</th>
                                    <th>Badges</th>
                                </tr>
                            </thead>
                            <tbody>
                                {players.map((player) => (
                                    <tr key={player.id} className={`${getRankClass(player.rank)} ${player.id === user?._id ? 'is-you' : ''}`}>
                                        <td className="rank-cell">
                                            {getRankIcon(player.rank)}
                                        </td>
                                        <td className="player-cell">
                                            <div className="player-info">
                                                <div className="player-avatar-small">
                                                    {player.photoURL ? (
                                                        <img src={player.photoURL} alt={player.displayName} />
                                                    ) : (
                                                        <User size={16} />
                                                    )}
                                                </div>
                                                <span>{player.displayName}</span>
                                                {player.id === user?._id && <span className="you-tag">You</span>}
                                            </div>
                                        </td>
                                        <td className="score-cell">{player.score}/100</td>
                                        <td>{player.level}</td>
                                        <td>{player.xp}</td>
                                        <td>{player.scenariosCompleted || 0}</td>
                                        <td>{player.badgesCount || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="leaderboard-empty">
                    <Trophy size={60} />
                    <h3>No rankings yet!</h3>
                    <p>Complete scenarios to appear on the leaderboard.</p>
                </div>
            )}
        </div>
    );
}
