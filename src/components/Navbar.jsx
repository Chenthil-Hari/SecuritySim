import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Crosshair, Award, Settings, Menu, X, LogIn, LogOut } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
    const { score } = useGame();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate('/login');
    };

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
                {user && (
                    <>
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
                    </>
                )}
                <li>
                    <NavLink to="/settings" onClick={() => setMenuOpen(false)}>
                        <Settings size={16} /> Settings
                    </NavLink>
                </li>
            </ul>

            <div className="navbar-right">
                {user && (
                    <div className="score-pill" title="Cyber Safety Score">
                        <Shield size={14} />
                        {score}
                    </div>
                )}
                {user ? (
                    <button className="btn-outline logout-btn" onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <LogOut size={16} /> Logout
                    </button>
                ) : (
                    <Link to="/login" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <LogIn size={16} /> Login
                    </Link>
                )}
            </div>
        </nav>
    );
}
