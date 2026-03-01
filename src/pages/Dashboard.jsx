import { Link } from 'react-router-dom';
import { Shield, Zap, Target, CheckCircle, TrendingUp, Crosshair, Mail, Phone, Bug, Users } from 'lucide-react';
import { useGame } from '../context/GameContext';
import ScoreRing from '../components/ScoreRing';
import StatCard from '../components/StatCard';
import ScenarioCard from '../components/ScenarioCard';
import scenarios from '../data/scenarios';
import './Dashboard.css';

const categoryIcons = { 'Phishing': Mail, 'Scam Calls': Phone, 'Malware': Bug, 'Social Engineering': Users };

export default function Dashboard() {
    const { score, xp, level, completedScenarios, difficulty } = useGame();

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

    if (completedCount === 0) {
        return (
            <div className="dashboard">
                <div className="empty-dashboard">
                    <Shield size={64} />
                    <h2>Welcome to Your Dashboard</h2>
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
        </div>
    );
}
