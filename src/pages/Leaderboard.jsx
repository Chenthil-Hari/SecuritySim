import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Shield, Zap, Medal, Crown, Star, Globe, MapPin } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import './Leaderboard.css';

const Leaderboard = () => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('global'); // 'global' or 'regional'

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                let url = '/api/leaderboard';

                // If on regional tab and user is logged in and has a country
                if (tab === 'regional' && user && user.country && user.country !== 'Global') {
                    url += `?country=${encodeURIComponent(user.country)}`;
                }

                const response = await fetch(buildApiUrl(url));
                if (response.ok) {
                    const data = await response.json();
                    setLeaderboard(data);
                } else {
                    setError('Failed to load leaderboard');
                }
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                setError('Could not connect to server');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [tab, user]);

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown size={20} className="rank-icon gold" />;
        if (rank === 2) return <Medal size={20} className="rank-icon silver" />;
        if (rank === 3) return <Medal size={20} className="rank-icon bronze" />;
        return <span className="rank-number">{rank}</span>;
    };

    if (loading) {
        return (
            <div className="leaderboard-container">
                <div className="leaderboard-loading">Loading leaderboard...</div>
            </div>
        );
    }

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <Trophy size={32} className="leaderboard-icon" />
                <h1>{tab === 'regional' ? 'Regional Leaderboard' : 'Global Leaderboard'}</h1>
                <p>Top agents ranked by Cumulative Cyber Score</p>

                <div className="leaderboard-tabs">
                    <button
                        className={`tab-btn ${tab === 'global' ? 'active' : ''}`}
                        onClick={() => setTab('global')}
                    >
                        <Globe size={16} /> Global
                    </button>
                    <button
                        className={`tab-btn ${tab === 'regional' ? 'active' : ''}`}
                        onClick={() => setTab('regional')}
                    >
                        <MapPin size={16} /> Regional
                    </button>
                </div>

                {tab === 'regional' && (!user || !user.country || user.country === 'Global') && (
                    <div className="regional-warning">
                        You have not selected a specific country for Regional rankings. Showing Global results.
                    </div>
                )}
            </div>

            {error && <div className="leaderboard-error">{error}</div>}

            {leaderboard.length === 0 && !error ? (
                <div className="leaderboard-empty">
                    <Star size={48} />
                    <h2>No agents in this region</h2>
                    <p>Be the first to claim the top spot here!</p>
                </div>
            ) : (
                <div className="leaderboard-table-wrapper">
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th className="col-rank">Rank</th>
                                <th className="col-agent">Agent</th>
                                <th className="col-region">Region</th>
                                <th className="col-score">Score</th>
                                <th className="col-level">Level</th>
                                <th className="col-xp">XP</th>
                                <th className="col-badges">Badges</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((entry) => (
                                <tr
                                    key={entry.id}
                                    className={`leaderboard-row ${user && user.id === entry.id ? 'current-user' : ''} ${entry.rank <= 3 ? 'top-3' : ''}`}
                                >
                                    <td className="col-rank">{getRankIcon(entry.rank)}</td>
                                    <td className="col-agent">
                                        <div className="agent-cell">
                                            <div className="agent-avatar-sm">
                                                {entry.profilePhoto ? (
                                                    <img src={entry.profilePhoto} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    entry.username.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <span className="agent-name">
                                                {entry.username}
                                                {user && user.id === entry.id && <span className="you-tag">YOU</span>}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="col-region">
                                        <span className="region-badge">{entry.country || 'Global'}</span>
                                    </td>
                                    <td className="col-score">
                                        <div className="score-cell">
                                            <Shield size={14} />
                                            <span>{entry.score}</span>
                                        </div>
                                    </td>
                                    <td className="col-level">{entry.level}</td>
                                    <td className="col-xp">
                                        <div className="xp-cell">
                                            <Zap size={14} />
                                            <span>{entry.xp}</span>
                                        </div>
                                    </td>
                                    <td className="col-badges">{entry.badgeCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
