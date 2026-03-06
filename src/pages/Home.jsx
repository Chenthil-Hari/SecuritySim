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
                    <h1 className="hero-title">
                        SecuritySim
                    </h1>

                    <p className="hero-badge" style={{ margin: "0 auto 2rem", background: "transparent", border: "none", fontSize: "1.1rem", borderBottom: "1px solid rgba(0, 255, 204, 0.3)", borderRadius: "0", paddingBottom: "0.5rem" }}>
                        Cybersecurity Simulation Platform
                    </p>

                    <p className="hero-subtitle">
                        Experience realistic cyber threats in a safe virtual environment. Learn to identify phishing,
                        scam calls, malware, and social engineering — before they find you in the real world.
                    </p>

                    <div className="hero-actions">
                        <Link to="/dashboard" className="btn-primary">
                            <LayoutDashboard size={18} />
                            View Dashboard
                            <ArrowRight size={16} />
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


            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-box">
                    <Zap size={40} style={{ color: 'var(--primary)', marginBottom: 16 }} />
                    <h2>Ready to Test Your Defenses?</h2>
                    <p>Enter the dashboard and discover how prepared you are against real-world cyber threats.</p>
                    <Link to="/dashboard" className="btn-primary">
                        Enter Dashboard <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            <footer className="home-footer">
                <p>SecuritySim:Cyber Survival — Cybersecurity Awareness Through Simulation · 2026</p>
            </footer>
        </div>
    );
}
