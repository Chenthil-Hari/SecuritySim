import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Crosshair, Award, Settings, Menu, X, LogOut, LogIn, UserPlus, User, Trophy, Zap, Calendar, Users, Swords, Globe, ChevronDown, Gamepad2, Search, Crown } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { getRank } from '../utils/ranks';
import { playClick } from '../utils/soundEffects';
import './Navbar.css';

export default function Navbar() {
    const gameState = useGame();
    const { score = 0, level = 1, settings = {} } = gameState || {};
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [multiplayerOpen, setMultiplayerOpen] = useState(false);
    const [gamesOpen, setGamesOpen] = useState(false);
    const navigate = useNavigate();

    const playNavSound = () => {
        if (settings?.soundEffects) {
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
                            <NavLink to="/interactive-scenarios" onClick={handleNavClick}>
                                <Shield size={16} /> Cases
                            </NavLink>
                        </li>
                        <li
                            className={`nav-dropdown ${gamesOpen ? 'open' : ''}`}
                            onMouseEnter={() => setGamesOpen(true)}
                            onMouseLeave={() => setGamesOpen(false)}
                            onClick={() => setGamesOpen(!gamesOpen)}
                        >
                            <button className="dropdown-trigger" type="button">
                                <Gamepad2 size={16} /> Games <ChevronDown size={14} className={gamesOpen ? 'rotate' : ''} />
                            </button>
                            <ul className="dropdown-menu">
                                <li>
                                    <NavLink to="/forensics" onClick={handleNavClick}>
                                        <Search size={16} /> Forensics
                                    </NavLink>
                                </li>
                            </ul>
                        </li>
                        <li
                            className={`nav-dropdown ${multiplayerOpen ? 'open' : ''}`}
                            onMouseEnter={() => setMultiplayerOpen(true)}
                            onMouseLeave={() => setMultiplayerOpen(false)}
                            onClick={() => setMultiplayerOpen(!multiplayerOpen)}
                        >
                            <button className="dropdown-trigger" type="button">
                                <Globe size={16} /> Multiplayer <ChevronDown size={14} className={multiplayerOpen ? 'rotate' : ''} />
                            </button>
                            <ul className="dropdown-menu">
                                <li>
                                    <NavLink to="/teams" onClick={handleNavClick}>
                                        <Users size={16} /> Teams
                                    </NavLink>
                                </li>
                            </ul>
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
                        {user.role === 'admin' && (
                            <li>
                                <NavLink to="/admin/dashboard" className="hq-link-special" onClick={handleNavClick}>
                                    <Crown size={16} /> HQ
                                </NavLink>
                            </li>
                        )}
                    </>
                )}
                <li>
                    <NavLink to="/settings" onClick={handleNavClick}>
                        <Settings size={16} /> Settings
                    </NavLink>
                </li>

                {/* Mobile-only Auth/User section */}
                <li className="mobile-only-nav-section">
                    {user ? (
                        <div className="mobile-user-info">
                            <div className="user-details">
                                <span title={getRank(level).title}>{getRank(level).icon}</span>
                                <span>{user.username}</span>
                                <div className="score-pill">
                                    <Shield size={14} /> {score}
                                </div>
                            </div>
                            <button className="logout-btn full-width" onClick={handleLogout}>
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    ) : (
                        <div className="mobile-auth-buttons">
                            <Link to="/login" className="login-btn" onClick={handleNavClick}>
                                <LogIn size={16} /> Login
                            </Link>
                            <Link to="/signup" className="signup-btn" onClick={handleNavClick}>
                                <UserPlus size={16} /> Signup
                            </Link>
                        </div>
                    )}
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
