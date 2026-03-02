import { NavLink, Link } from 'react-router-dom';
import { Shield, LayoutDashboard, Crosshair, Award, Settings, Menu, X, User, Trophy } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
    const { score } = useGame();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="navbar" role="navigation" aria-label="Main navigation">
            <Link to="/" className="navbar-brand">
                <Shield size={28} />
                <span>SecuritySim:Cyber Survival</span>
            </Link>

            <button
                className="mobile-menu-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                <li>
                    <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
                        <LayoutDashboard size={16} /> Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/scenarios" onClick={() => setMenuOpen(false)}>
                        <Crosshair size={16} /> Scenarios
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/achievements" onClick={() => setMenuOpen(false)}>
                        <Award size={16} /> Achievements
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/leaderboard" onClick={() => setMenuOpen(false)}>
                        <Trophy size={16} /> Leaderboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/profile" onClick={() => setMenuOpen(false)}>
                        <User size={16} /> Profile
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/settings" onClick={() => setMenuOpen(false)}>
                        <Settings size={16} /> Settings
                    </NavLink>
                </li>
            </ul>

            <div className="navbar-right">
                <div className="score-pill" title="Cyber Safety Score">
                    <Shield size={14} />
                    {score}
                </div>
            </div>
        </nav>
    );
}
