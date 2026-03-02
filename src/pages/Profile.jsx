import { useGame } from '../context/GameContext';
import { useGameDispatch } from '../context/GameContext';
import { Shield, Award, Target, Zap, User, RotateCcw } from 'lucide-react';
import './Profile.css';

export default function Profile() {
    const gameState = useGame();
    const dispatch = useGameDispatch();

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            dispatch({ type: 'RESET_PROGRESS' });
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar">
                    <User size={48} />
                </div>
                <div className="profile-info">
                    <h1>Player Profile</h1>
                    <p>Your cybersecurity training progress</p>
                </div>
            </div>

            <div className="profile-stats-grid">
                <div className="profile-stat-card">
                    <Shield size={28} />
                    <div>
                        <h3>Safety Score</h3>
                        <p className="stat-value">{gameState.score}/100</p>
                    </div>
                </div>
                <div className="profile-stat-card">
                    <Zap size={28} />
                    <div>
                        <h3>Level</h3>
                        <p className="stat-value">{gameState.level}</p>
                    </div>
                </div>
                <div className="profile-stat-card">
                    <Target size={28} />
                    <div>
                        <h3>XP Earned</h3>
                        <p className="stat-value">{gameState.xp}</p>
                    </div>
                </div>
                <div className="profile-stat-card">
                    <Award size={28} />
                    <div>
                        <h3>Badges</h3>
                        <p className="stat-value">{gameState.badges.length}</p>
                    </div>
                </div>
            </div>

            <div className="profile-section">
                <h2>Completed Scenarios</h2>
                {gameState.completedScenarios.length > 0 ? (
                    <div className="completed-list">
                        {gameState.completedScenarios.map((s, i) => (
                            <div key={i} className="completed-item">
                                <span className="completed-category">{s.category}</span>
                                <span className="completed-accuracy">{s.accuracy}% accuracy</span>
                                <span className="completed-date">{new Date(s.timestamp).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No scenarios completed yet. Start training!</p>
                )}
            </div>

            <div className="profile-section">
                <h2>Badges Earned</h2>
                {gameState.badges.length > 0 ? (
                    <div className="badges-list">
                        {gameState.badges.map((badge, i) => (
                            <span key={i} className="badge-chip">{badge}</span>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No badges earned yet. Complete scenarios to earn badges!</p>
                )}
            </div>

            <div className="profile-actions">
                <button className="btn-danger" onClick={handleReset}>
                    <RotateCcw size={16} /> Reset All Progress
                </button>
            </div>
        </div>
    );
}
