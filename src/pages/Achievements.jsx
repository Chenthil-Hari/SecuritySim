import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import BadgeComponent from '../components/Badge';
import ScoreRing from '../components/ScoreRing';
import badgesList from '../data/badges';
import './Achievements.css';

export default function Achievements() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { badges: earnedBadges, level, xp } = useGame();

    const earnedCount = earnedBadges.length;
    const totalCount = badgesList.length;
    const earnedPercent = Math.round((earnedCount / totalCount) * 100);
    const xpInLevel = xp % 100;

    if (!user) {
        return (
            <div className="achievements-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', maxWidth: '500px' }}>
                    <Lock size={64} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Locked Badges</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.1rem' }}>
                        You need an account to track your progress and earn cyber defense badges.
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
        <div className="achievements-page">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
                <ArrowLeft size={18} /> Back to Dashboard
            </button>
            <div className="achievements-header">
                <h1>Achievements</h1>
                <p>Track your progress and earn badges by mastering cyber defense skills</p>
            </div>

            <div className="achievements-summary">
                <div className="achievements-progress-ring">
                    <ScoreRing score={earnedPercent} size={120} strokeWidth={8} label="Complete" className="small" />
                </div>
                <div className="achievements-progress-info">
                    <h2>{earnedCount} of {totalCount} Badges Earned</h2>
                    <p>Complete scenarios with high accuracy to unlock new badges and prove your cybersecurity expertise.</p>
                </div>
            </div>

            <div className="level-section">
                <h2>Level Progression</h2>
                <div className="level-bar-container">
                    <div className="level-bar-header">
                        <span className="level-bar-current">Level {level}</span>
                        <span className="level-bar-xp">{xpInLevel}/100 XP to Level {level + 1}</span>
                    </div>
                    <div className="level-bar">
                        <div className="level-bar-fill" style={{ width: `${xpInLevel}%` }} />
                    </div>
                </div>
            </div>

            <div className="badges-section">
                <h2>Badge Collection</h2>
                <div className="badges-grid stagger">
                    {badgesList.map(badge => (
                        <BadgeComponent
                            key={badge.id}
                            badge={badge}
                            earned={earnedBadges.includes(badge.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
