import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, useGameDispatch } from '../context/GameContext';
import { Target, Clock, Award, ShieldAlert, ArrowRight } from 'lucide-react';
import weeklyChallenge from '../data/weeklyChallenges';
import './WeeklyChallenge.css';

export default function WeeklyChallenge() {
    const { state } = useGame();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState('');

    const isCompleted = state.weeklyCompleted?.includes(weeklyChallenge.id);

    // Calculate time until Sunday midnight UTC
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const nextSunday = new Date();
            nextSunday.setUTCHours(23, 59, 59, 999);
            nextSunday.setUTCDate(now.getUTCDate() + (7 - now.getUTCDay()));

            const diff = nextSunday - now;
            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const mins = Math.floor((diff / 1000 / 60) % 60);
                setTimeLeft(`${days}d ${hours}h ${mins}m`);
            } else {
                setTimeLeft('Expired');
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="weekly-challenge-page">
            <header className="weekly-header">
                <div className="weekly-title-area">
                    <ShieldAlert size={32} className="pulse-icon" />
                    <h1>Weekly Black Ops</h1>
                </div>
                <div className="weekly-timer">
                    <Clock size={16} /> Ends in: <strong>{timeLeft}</strong>
                </div>
            </header>

            <div className="weekly-card">
                {isCompleted && (
                    <div className="completion-banner">
                        <Award size={24} /> MISSION ACCOMPLISHED — Rewards Claimed
                    </div>
                )}

                <div className="weekly-content">
                    <h2>{weeklyChallenge.title}</h2>
                    <span className="difficulty-badge level-4">Difficulty Level {weeklyChallenge.difficulty}</span>

                    <p className="weekly-desc">{weeklyChallenge.description}</p>

                    <div className="weekly-rewards">
                        <h3>Rewards for Successful Completion:</h3>
                        <ul>
                            <li><Target size={16} /> <strong>{weeklyChallenge.xpReward.toLocaleString()} XP</strong> Base Bounty</li>
                            <li><Award size={16} /> Exclusive <strong>"{weeklyChallenge.badgeReward}"</strong> Profile Badge</li>
                        </ul>
                    </div>

                    <div className="weekly-actions">
                        <button
                            className="btn-primary"
                            disabled={isCompleted}
                            onClick={() => navigate(`/scenarios/weekly/${weeklyChallenge.id}`)}
                        >
                            {isCompleted ? 'Already Completed' : 'Deploy Now'} <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
