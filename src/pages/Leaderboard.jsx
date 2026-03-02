import { useGame } from '../context/GameContext';
import { Trophy, Medal, Shield, Crown } from 'lucide-react';
import './Leaderboard.css';

export default function Leaderboard() {
    const gameState = useGame();

    // Local-only leaderboard — shows just the current player's stats
    const player = {
        rank: 1,
        displayName: 'You',
        score: gameState.score,
        level: gameState.level,
        xp: gameState.xp,
        scenariosCompleted: gameState.completedScenarios.length,
        badgesCount: gameState.badges.length
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown size={22} className="rank-icon gold" />;
        if (rank === 2) return <Medal size={22} className="rank-icon silver" />;
        if (rank === 3) return <Medal size={22} className="rank-icon bronze" />;
        return <span className="rank-number">{rank}</span>;
    };

    return (
        <div className="leaderboard-page">
            <div className="leaderboard-header">
                <div className="leaderboard-title">
                    <Trophy size={32} />
                    <div>
                        <h1>Leaderboard</h1>
                        <p>Your cyber defender ranking</p>
                    </div>
                </div>
            </div>

            {/* Podium */}
            <div className="podium">
                <div className="podium-card rank-gold is-you">
                    <div className="podium-rank">{getRankIcon(1)}</div>
                    <h3 className="podium-name">You</h3>
                    <div className="podium-score">
                        <Shield size={16} />
                        <span>{player.score}/100</span>
                    </div>
                    <div className="podium-stats">
                        <span>Lvl {player.level}</span>
                        <span>•</span>
                        <span>{player.xp} XP</span>
                    </div>
                    <div className="you-badge">You</div>
                </div>
            </div>

            {/* Stats Table */}
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
                        <tr className="rank-gold is-you">
                            <td className="rank-cell">{getRankIcon(1)}</td>
                            <td className="player-cell">
                                <div className="player-info">
                                    <span>You</span>
                                    <span className="you-tag">You</span>
                                </div>
                            </td>
                            <td className="score-cell">{player.score}/100</td>
                            <td>{player.level}</td>
                            <td>{player.xp}</td>
                            <td>{player.scenariosCompleted}</td>
                            <td>{player.badgesCount}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
