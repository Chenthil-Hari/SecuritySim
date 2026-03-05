import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Shield, Zap, Medal, Crown, Star, Globe, MapPin, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildApiUrl } from '../utils/api';
import { getRank } from '../utils/ranks';
import Loader from '../components/Loader';
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

    if (loading) return <Loader />;

    if (!user) {
        return (
            <div className="leaderboard-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', maxWidth: '500px' }}>
                    <Lock size={64} style={{ color: 'var(--warning)', marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Rankings Locked</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.1rem' }}>
                        You need an active account to view Top Agents and compete on the global and regional leaderboards.
                    </p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <Link to="/login" className="btn-primary" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
                            Log In
                        </Link>
                        <Link to="/signup" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', borderRadius: 'var(--radius-md)' }}>
                            Sign Up
                        </Link>
                    </div>
                </div>
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
                                    className={`leaderboard-row ${user && user.id === entry.id ? 'current-user' : ''} ${entry.rank <= 3 ? 'top-3' : ''} ${entry.rank === 1 ? 'rank-1-row' : ''} ${entry.customization?.auraEnabled && entry.rank <= 50 ? 'has-aura' : ''}`}
                                    style={entry.customization?.auraEnabled && entry.rank <= 50 ? {
                                        '--aura-color': entry.rank === 1 ? '#ffd700' : entry.rank <= 10 ? '#00f0ff' : '#7c4dff',
                                        '--aura-opacity': entry.rank === 1 ? '0.4' : '0.2'
                                    } : {}}
                                >
                                    <td className="col-rank">
                                        {entry.rank === 1 && <div className="rank-1-aura" />}
                                        {getRankIcon(entry.rank)}
                                    </td>
                                    <td className="col-agent">
                                        <div className="agent-cell">
                                            <div className="agent-avatar-sm">
                                                {entry.profilePhoto ? (
                                                    <img src={entry.profilePhoto} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    entry.username.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="agent-name">
                                                <div className="agent-name-main">
                                                    <span title={getRank(entry.level).title}>{getRank(entry.level).icon}</span>
                                                    <Link to={`/profile/${entry.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                        <strong>{entry.username}</strong>
                                                    </Link>
                                                    {user && user.id === entry.id && <span className="you-tag">YOU</span>}

                                                    {entry.seasonalMedals && entry.seasonalMedals.length > 0 && (
                                                        <div className="seasonal-medals">
                                                            {entry.seasonalMedals.map((m, i) => (
                                                                <div key={i} className="medal-tooltip" title={`Season Winner: ${m.season}`}>
                                                                    <Medal size={14} className={`rank-icon ${m.type}`} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {entry.unlockedTitles && entry.unlockedTitles.length > 0 && (
                                                    <span className="agent-title">{entry.unlockedTitles[entry.unlockedTitles.length - 1]}</span>
                                                )}
                                            </div>
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
