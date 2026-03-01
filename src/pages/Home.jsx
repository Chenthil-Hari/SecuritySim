import { Link } from 'react-router-dom';
import { Shield, Crosshair, TrendingUp, Award, Zap, ArrowRight, LayoutDashboard } from 'lucide-react';
import './Home.css';

export default function Home() {
    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-grid" />
                    <div className="hero-orb orb1" />
                    <div className="hero-orb orb2" />
                    <div className="hero-orb orb3" />
                </div>

                <div className="hero-content">
                    <div className="hero-badge">
                        <Shield size={14} />
                        Cybersecurity Simulation Platform
                    </div>

                    <h1 className="hero-title">
                        Master Cyber Defense in <span className="gradient-text">SecuritySim:Cyber Survival</span>
                    </h1>

                    <p className="hero-subtitle">
                        Experience realistic cyber threats in a safe virtual environment. Learn to identify phishing,
                        scam calls, malware, and social engineering — before they find you in the real world.
                    </p>

                    <div className="hero-actions">
                        <Link to="/scenarios" className="btn-primary">
                            <Crosshair size={18} />
                            Start Training
                            <ArrowRight size={16} />
                        </Link>
                        <Link to="/dashboard" className="btn-outline">
                            <LayoutDashboard size={18} />
                            View Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="section-header">
                    <span className="section-tag">Features</span>
                    <h2 className="section-title">Why SecuritySim:Cyber Survival?</h2>
                    <p className="section-desc">
                        A comprehensive platform designed to build your cyber defenses through immersive, hands-on experience.
                    </p>
                </div>

                <div className="features-grid stagger">
                    <div className="feature-card">
                        <div className="feature-icon cyan">
                            <Crosshair size={24} />
                        </div>
                        <h3>Realistic Scenarios</h3>
                        <p>Face true-to-life phishing emails, AI voice clone scams, fake antivirus popups, and social engineering attacks.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon purple">
                            <TrendingUp size={24} />
                        </div>
                        <h3>Adaptive Difficulty</h3>
                        <p>The system learns from your performance and progressively increases challenge level as your skills grow.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon green">
                            <Shield size={24} />
                        </div>
                        <h3>Cyber Safety Score</h3>
                        <p>Track your overall security awareness with a personalized score that highlights strengths and weaknesses.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon pink">
                            <Award size={24} />
                        </div>
                        <h3>Achievements & Badges</h3>
                        <p>Earn badges for mastering different threat categories and reaching new levels of cyber awareness.</p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="section-header">
                    <span className="section-tag">How It Works</span>
                    <h2 className="section-title">Three Steps to Cyber Safety</h2>
                </div>

                <div className="steps-container stagger">
                    <div className="step-item">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Choose a Scenario</h3>
                            <p>Browse realistic cyber threat scenarios across four categories: Phishing, Scam Calls, Malware, and Social Engineering.</p>
                        </div>
                    </div>

                    <div className="step-item">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Make Your Decisions</h3>
                            <p>React to each threat just like you would in real life. Choose how to respond and get instant feedback on your choices.</p>
                        </div>
                    </div>

                    <div className="step-item">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Level Up Your Awareness</h3>
                            <p>Learn practical defense strategies, earn XP and badges, and watch your Cyber Safety Score climb as you master each threat type.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-box">
                    <Zap size={40} style={{ color: 'var(--primary)', marginBottom: 16 }} />
                    <h2>Ready to Test Your Defenses?</h2>
                    <p>Start your first scenario and discover how prepared you are against real-world cyber threats.</p>
                    <Link to="/scenarios" className="btn-primary">
                        Launch Simulation <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            <footer className="home-footer">
                <p>SecuritySim:Cyber Survival — Cybersecurity Awareness Through Simulation · 2026</p>
            </footer>
        </div>
    );
}
