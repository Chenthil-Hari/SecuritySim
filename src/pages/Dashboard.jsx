import { Link } from 'react-router-dom';
import { Shield, Zap, Target, CheckCircle, TrendingUp, Crosshair, Mail, Phone, Bug, Users, PlayCircle, Trophy, Search } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import ScoreRing from '../components/ScoreRing';
import StatCard from '../components/StatCard';
import NewsFeed from '../components/NewsFeed';
import { useSystemStatus } from '../context/SystemStatusContext';

import { getRank } from '../utils/ranks';
import { buildApiUrl } from '../utils/api';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInUp, fadeInDown, springScale, tacticalHover, tacticalTap } from '../utils/animations';
import './Dashboard.css';

export default function Dashboard() {
    const { score, xp, level, difficulty } = useGame();
    const { user } = useAuth();
    const { features } = useSystemStatus();
    const [activeEvents, setActiveEvents] = useState([]);
    const [featuredScenarios, setFeaturedScenarios] = useState([]);
    const xpInLevel = xp % 100;

    useEffect(() => {
        const fetchHighlights = async () => {
            try {
                const [evRes, featRes] = await Promise.all([
                    fetch(buildApiUrl('/api/events/active')),
                    fetch(buildApiUrl('/api/ugc-scenarios/featured'))
                ]);
                if (evRes.ok) setActiveEvents(await evRes.json());
                if (featRes.ok) setFeaturedScenarios(await featRes.json());
            } catch (err) {
                console.error("Failed to fetch dashboard highlights:", err);
            }
        };
        fetchHighlights();
    }, []);

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


    return (
        <motion.div 
            className="dashboard"
            variants={staggerContainer()}
            initial="hidden"
            animate="show"
            data-version="2.1-tactical"
        >
            <motion.div className="dashboard-header" variants={fadeInDown}>
                <h1>Risk Assessment Dashboard {activeEvents.length > 0 && <span className="live-tag">OPS LIVE</span>}</h1>
                <p>Tactical Awareness Protocol v2.1 active</p>
            </motion.div>

            <AnimatePresence>
                {activeEvents.map(event => (
                    <motion.div 
                        key={event._id} 
                        className={`event-banner ${event.type.toLowerCase()}`}
                        variants={fadeInUp}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <Zap size={20} />
                        <div className="event-banner-content">
                            <h3>{event.title}</h3>
                            <p>{event.description} — <strong>{event.multiplier}x Multiplier Active</strong></p>
                        </div>
                        <div className="event-timer">
                            ENDS {new Date(event.expiresAt).toLocaleDateString()}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            <motion.div variants={fadeInUp}>
                <NewsFeed />
            </motion.div>

            <div className="dashboard-grid">
                <motion.div className="dashboard-score-panel" variants={springScale}>
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
                </motion.div>

                <motion.div className="stats-column" variants={staggerContainer(0.2)}>
                    <motion.div variants={fadeInUp}>
                        <StatCard icon={TrendingUp} label="Level" value={level} sub={`${xp} total XP`} color="purple" />
                    </motion.div>
                    <motion.div variants={fadeInUp}>
                        <StatCard icon={Zap} label="Total XP" value={xp} sub="Experience points" color="yellow" />
                    </motion.div>
                </motion.div>
            </div>

            {features.ugc !== false && featuredScenarios.length > 0 && (
                <motion.div className="featured-missions" variants={fadeInUp}>
                    <div className="section-header">
                        <h2><Target size={20} /> Priority Missions</h2>
                        <Link to="/scenarios" className="text-link">View All</Link>
                    </div>
                    <motion.div className="featured-grid" variants={staggerContainer(0.15)}>
                        {featuredScenarios.map(s => (
                            <motion.div key={s._id} variants={springScale} whileHover={tacticalHover('#00f0ff')} whileTap={tacticalTap}>
                                <Link to={`/scenario/${s._id}`} className="featured-card">
                                    <div className="card-badge">FEATURED</div>
                                    <div className="featured-card-content">
                                        <span className="scen-cat">{s.category}</span>
                                        <h3>{s.title}</h3>
                                        <div className="scen-author">by {s.authorId?.username || 'System'}</div>
                                    </div>
                                    <PlayCircle size={32} className="play-icon" />
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            )}

            {features.forensics !== false && (
                <motion.div className="forensics-preview" variants={fadeInUp} whileHover={{ y: -5 }}>
                    <div className="preview-content">
                        <div className="preview-icon">
                            <Search size={32} />
                        </div>
                        <div className="preview-text">
                            <h3>New: File Forensics Mini-Game</h3>
                            <p>Put on your investigator hat. Scour the file system for malware and secure the site.</p>
                        </div>
                        <motion.div whileHover={tacticalHover('#a855f7')} whileTap={tacticalTap}>
                            <Link to="/forensics" className="btn-primary">
                                Play Now
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            )}


            <motion.div className="dashboard-footer" variants={fadeInUp}>
                <Link to="/contact" className="dashboard-contact-link">
                    <Mail size={16} /> Contact Support
                </Link>
            </motion.div>
        </motion.div>
    );
}
