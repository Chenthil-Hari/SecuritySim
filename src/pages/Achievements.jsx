import { useGame } from '../context/GameContext';
import BadgeComponent from '../components/Badge';
import ScoreRing from '../components/ScoreRing';
import badgesList from '../data/badges';
import './Achievements.css';

export default function Achievements() {
    const { badges: earnedBadges, level, xp } = useGame();

    const earnedCount = earnedBadges.length;
    const totalCount = badgesList.length;
    const earnedPercent = Math.round((earnedCount / totalCount) * 100);
    const xpInLevel = xp % 100;

    return (
        <div className="achievements-page">
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
