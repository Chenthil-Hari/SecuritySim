import { Link } from 'react-router-dom';
import { Shield, Zap, Target, CheckCircle, TrendingUp, Crosshair, Mail, Phone, Bug, Users, PlayCircle, Trophy, Search } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import ScoreRing from '../components/ScoreRing';
import StatCard from '../components/StatCard';
import ScenarioCard from '../components/ScenarioCard';

import scenarios from '../data/scenarios';
import { getRank } from '../utils/ranks';
import './Dashboard.css';

const categoryIcons = { 'Phishing': Mail, 'Scam Calls': Phone, 'Malware': Bug, 'Social Engineering': Users };

export default function Dashboard() {
    const { score, xp, level, completedScenarios, difficulty } = useGame();
    const { user } = useAuth();

    const totalScenarios = scenarios.length;
    const completedCount = completedScenarios.length;
    const accuracy = completedCount > 0
        ? Math.round(completedScenarios.reduce((s, c) => s + c.accuracy, 0) / completedCount)
        : 0;
    const xpInLevel = xp % 100;

    // Category performance
    const categories = ['Phishing', 'Scam Calls', 'Malware', 'Social Engineering'];
    const categoryPerformance = categories.map(cat => {
        const catScenarios = completedScenarios.filter(s => s.category === cat);
        const avg = catScenarios.length > 0
            ? Math.round(catScenarios.reduce((s, c) => s + c.accuracy, 0) / catScenarios.length)
            : 0;
        return { name: cat, accuracy: avg, count: catScenarios.length };
    });

    // Recommended: not-yet-completed or lowest accuracy categories
    const uncompletedScenarios = scenarios.filter(
        s => !completedScenarios.find(c => c.scenarioId === s.id)
    );
    const recommended = uncompletedScenarios.slice(0, 3);

    if (!user) {
        return (
            <div className="dashboard">
                <div className="dashboard-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1>Welcome to SecuritySim</h1>
                    <p>Interactive Cybersecurity Training Platform</p>
                </div>

                <div className="stats-column" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div className="stat-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                        <PlayCircle size={40} color="var(--primary)" style={{ margin: '0 auto 15px' }} />
                        <h3 style={{ margin: '0 0 10px', color: 'white' }}>Learn by Playing</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Engage in realistic cyber threat scenarios and learn how to defend against phishing, malware, and social engineering.</p>
                    </div>
                    <div className="stat-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                        <Zap size={40} color="var(--warning)" style={{ margin: '0 auto 15px' }} />
                        <h3 style={{ margin: '0 0 10px', color: 'white' }}>Earn XP & Level Up</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Every correct decision earns you experience points. Track your cyber safety score and unlock harder difficulties.</p>
                    </div>
                    <div className="stat-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                        <Trophy size={40} color="var(--success)" style={{ margin: '0 auto 15px' }} />
                        <h3 style={{ margin: '0 0 10px', color: 'white' }}>Compete Globally</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Join the leaderboard and prove your cybersecurity awareness against other defenders around the world.</p>
                    </div>
                </div>

                <div className="empty-dashboard" style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(0,0,0,0.5))', border: '1px solid rgba(0,240,255,0.2)' }}>
                    <Shield size={64} style={{ color: 'var(--primary)' }} />
                    <h2 style={{ fontSize: '1.8rem' }}>Ready to start your training?</h2>
                    <p style={{ fontSize: '1.1rem' }}>Create a free account to track your progress, access all scenarios, and talk with Cipher, your personal AI Cyber Specialist.</p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                        <Link to="/signup" className="btn-primary">
                            Create Account
                        </Link>
                        <Link to="/login" className="btn-secondary" style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
                            Log In
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (completedCount === 0) {
        return (
            <div className="dashboard">
                <div className="empty-dashboard">
                    <Shield size={64} />
                    <h2>Welcome to Your Dashboard, {user.username}!</h2>
                    <p>Complete your first scenario to see your Cyber Safety Score and performance analytics.</p>
                    <Link to="/scenarios" className="btn-primary">
                        <Crosshair size={18} /> Start Your First Scenario
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Risk Assessment Dashboard</h1>
                <p>Your cybersecurity awareness at a glance</p>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-score-panel">
                    <span className="score-panel-label">Cyber Safety Score</span>
                    <ScoreRing score={score} size={180} />

                    <div className="level-display">
                        <div className="level-number">Level {level}</div>
                        <div className="level-label">Difficulty: {['Beginner', 'Intermediate', 'Advanced'][difficulty - 1]}</div>
                        <div className="rank-display" style={{ color: getRank(level).color, marginTop: '6px', fontSize: '0.9rem', fontWeight: 600 }}>
                            {getRank(level).icon} {getRank(level).title}
                        </div>
                    </div>

                    <div className="xp-bar-container">
                        <div className="xp-bar-label">
                            <span>{xpInLevel} XP</span>
                            <span>100 XP to next level</span>
                        </div>
                        <div className="xp-bar">
                            <div className="xp-bar-fill" style={{ width: `${xpInLevel}%` }} />
                        </div>
                    </div>
                </div>

                <div className="stats-column">
                    <StatCard icon={TrendingUp} label="Level" value={level} sub={`${xp} total XP`} color="purple" />
                    <StatCard icon={Target} label="Accuracy" value={`${accuracy}%`} sub="Average score" color="cyan" />
                    <StatCard icon={CheckCircle} label="Completed" value={completedCount} sub={`of ${totalScenarios} scenarios`} color="green" />
                    <StatCard icon={Zap} label="Total XP" value={xp} sub="Experience points" color="yellow" />
                </div>
            </div>

            <div className="forensics-preview">
                <div className="preview-content">
                    <div className="preview-icon">
                        <Search size={32} />
                    </div>
                    <div className="preview-text">
                        <h3>New: File Forensics Mini-Game</h3>
                        <p>Put on your investigator hat. Scour the file system for malware and secure the site.</p>
                    </div>
                    <Link to="/forensics" className="btn-primary">
                        Play Now
                    </Link>
                </div>
            </div>

            <div className="category-section">
                <h2>Performance by Threat Category</h2>
                <div className="category-bars">
                    {categoryPerformance.map(cat => {
                        const Icon = categoryIcons[cat.name] || Shield;
                        const level = cat.accuracy >= 70 ? 'high' : cat.accuracy >= 40 ? 'medium' : 'low';
                        return (
                            <div className="category-bar-item" key={cat.name}>
                                <div className="category-bar-header">
                                    <span className="category-bar-name">
                                        <Icon size={16} />
                                        {cat.name}
                                    </span>
                                    <span className="category-bar-value">
                                        {cat.count > 0 ? `${cat.accuracy}%` : '—'}
                                    </span>
                                </div>
                                <div className="category-progress">
                                    <div
                                        className={`category-progress-fill ${level}`}
                                        style={{ width: `${cat.accuracy}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>



            {recommended.length > 0 && (
                <div className="recommended">
                    <h2>Recommended Next Scenarios</h2>
                    <div className="recommended-grid">
                        {recommended.map(s => (
                            <ScenarioCard key={s.id} scenario={s} />
                        ))}
                    </div>
                </div>
            )}

            <div className="dashboard-footer">
                <Link to="/contact" className="dashboard-contact-link">
                    <Mail size={16} /> Contact Support
                </Link>
            </div>
        </div>
    );
}
