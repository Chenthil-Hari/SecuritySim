import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Crosshair, Award, Settings, Menu, X, LogOut, LogIn, UserPlus, User, Trophy, Zap, Calendar, Users } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { getRank } from '../utils/ranks';
import { playClick } from '../utils/soundEffects';
import './Navbar.css';

export default function Navbar() {
    const { score, level } = useGame();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const playNavSound = () => {
        if (state.settings?.soundEffects) {
            playClick();
        }
    };

    const handleNavClick = () => {
        playNavSound();
        setMenuOpen(false);
    };

    const handleLogout = () => {
        playNavSound();
        logout();
        navigate('/login');
        setMenuOpen(false);
    };

    return (
        <nav className="navbar" role="navigation" aria-label="Main navigation">
            <Link to="/" className="navbar-brand" onClick={playNavSound}>
                <Shield size={28} />
                <span>SecuritySim:Cyber Survival</span>
            </Link>

            <button
                className="mobile-menu-btn"
                onClick={() => {
                    playNavSound();
                    setMenuOpen(!menuOpen);
                }}
                aria-label="Toggle menu"
            >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                <li>
                    <NavLink to="/dashboard" onClick={handleNavClick}>
                        <LayoutDashboard size={16} /> Dashboard
                    </NavLink>
                </li>
                {user && (
                    <>
                        <li>
                            <NavLink to="/scenarios" onClick={handleNavClick}>
                                <Crosshair size={16} /> Scenarios
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/teams" onClick={handleNavClick}>
                                <Users size={16} /> Teams
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/weekly" onClick={handleNavClick} className={({ isActive }) => isActive ? "active weekly-nav" : "weekly-nav"}>
                                <Calendar size={16} /> Weekly Op
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/achievements" onClick={handleNavClick}>
                                <Award size={16} /> Achievements
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/skill-tree" onClick={handleNavClick}>
                                <Zap size={16} /> Skill Tree
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/leaderboard" onClick={handleNavClick}>
                                <Trophy size={16} /> Leaderboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/profile" onClick={handleNavClick}>
                                <User size={16} /> Profile
                            </NavLink>
                        </li>
                    </>
                )}
                <li>
                    <NavLink to="/settings" onClick={handleNavClick}>
                        <Settings size={16} /> Settings
                    </NavLink>
                </li>
            </ul>

            <div className="navbar-right">
                {user ? (
                    <>
                        <div className="user-greeting">
                            <span title={getRank(level).title}>{getRank(level).icon}</span>
                            <span>{user.username}</span>
                        </div>
                        <div className="score-pill" title="Cyber Safety Score">
                            <Shield size={14} />
                            {score}
                        </div>
                        <button className="logout-btn" onClick={handleLogout} title="Logout">
                            <LogOut size={16} />
                        </button>
                    </>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="login-btn" onClick={playNavSound}>
                            <LogIn size={16} /> Login
                        </Link>
                        <Link to="/signup" className="signup-btn" onClick={playNavSound}>
                            <UserPlus size={16} /> Signup
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
