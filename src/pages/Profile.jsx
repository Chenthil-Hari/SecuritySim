import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { Shield, Zap, Award, Target, Calendar, Star, User, Edit2, X, Check, MapPin } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import badges from '../data/badges';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import './Profile.css';

const avatarPresets = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=Alpha&backgroundColor=00f0ff',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Beta&backgroundColor=ff4081',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Gamma&backgroundColor=7c4dff',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Delta&backgroundColor=ffd700',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Epsilon&backgroundColor=00ffaa',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Zeta&backgroundColor=ff5555'
];

const Profile = () => {
    const { user, updateUser } = useAuth();
    const gameState = useGame();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [editUsername, setEditUsername] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [editCountry, setEditCountry] = useState('Global');
    const [editError, setEditError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }
                const response = await fetch(buildApiUrl('/api/profile/me'), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setProfileData(data);
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const openEditModal = () => {
        setEditUsername(user.username);
        setEditAvatar(profileData?.profilePhoto || '');
        setEditCountry(user.country || 'Global');
        setEditError('');
        setIsEditing(true);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setEditError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(buildApiUrl('/api/profile/edit'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: editUsername !== user.username ? editUsername : undefined,
                    profilePhoto: editAvatar !== profileData?.profilePhoto ? editAvatar : undefined,
                    country: editCountry !== (user.country || 'Global') ? editCountry : undefined
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Update AuthContext and Local State immediately
            updateUser({
                username: data.user.username,
                profilePhoto: data.user.profilePhoto,
                country: data.user.country
            });
            setProfileData(data.user);
            setIsEditing(false);

        } catch (err) {
            setEditError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="profile-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', maxWidth: '500px' }}>
                    <Shield size={64} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Agent Profile Locked</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.1rem' }}>
                        You must create an account to track your Cyber Safety Score, earn XP, and unlock badges.
                    </p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <Link to="/login" className="btn-primary" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
                            Log In
                        </Link>
                        <Link to="/signup" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', borderRadius: 'var(--radius-md)' }}>
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return <Loader />;

    const score = gameState.score;
    const xp = gameState.xp;
    const level = gameState.level;
    const earnedBadges = gameState.badges;
    const completedScenarios = gameState.completedScenarios;
    const memberSince = profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    const xpToNext = 100 - (xp % 100);
    const xpProgress = (xp % 100) / 100 * 100;

    const allBadges = badges.map(b => ({
        ...b,
        earned: earnedBadges.includes(b.id)
    }));

    return (
        <div className="profile-container">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-avatar">
                    {profileData?.profilePhoto ? (
                        <img src={profileData.profilePhoto} alt="Profile" />
                    ) : (
                        <div className="avatar-placeholder">
                            <User size={48} />
                        </div>
                    )}
                    <div className="level-badge">Lv.{level}</div>
                </div>
                <div className="profile-info">
                    <div className="profile-title-row">
                        <h1>{user.username}</h1>
                        <button className="edit-profile-btn" onClick={openEditModal}>
                            <Edit2 size={16} /> Edit Profile
                        </button>
                    </div>
                    <p className="profile-email">{user.email}</p>
                    <div className="profile-meta">
                        <span><MapPin size={14} /> {user.country || 'Global'}</span>
                        <span><Calendar size={14} /> Joined {memberSince}</span>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal Overlay */}
            {isEditing && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal">
                        <div className="edit-modal-header">
                            <h2>Edit Agent Profile</h2>
                            <button className="close-modal-btn" onClick={() => setIsEditing(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="edit-modal-body">
                            {editError && <div className="edit-error">{editError}</div>}

                            <div className="edit-form-group">
                                <label>Agent Alias (Username)</label>
                                <input
                                    type="text"
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                    maxLength={30}
                                />
                            </div>

                            <div className="edit-form-group">
                                <label>Region (Country)</label>
                                <select
                                    value={editCountry}
                                    onChange={(e) => setEditCountry(e.target.value)}
                                    style={{ width: '100%', padding: '0.875rem 1rem', background: 'rgba(10, 15, 20, 0.6)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}
                                >
                                    <option value="Global">Global (Unspecified)</option>
                                    <option value="United States">United States</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="Canada">Canada</option>
                                    <option value="Australia">Australia</option>
                                    <option value="India">India</option>
                                    <option value="Germany">Germany</option>
                                    <option value="France">France</option>
                                    <option value="Japan">Japan</option>
                                    <option value="South Korea">South Korea</option>
                                    <option value="Brazil">Brazil</option>
                                </select>
                            </div>

                            <div className="edit-form-group">
                                <label>Select Avatar Protocol</label>
                                <div className="avatar-grid">
                                    <div
                                        className={`avatar-option ${editAvatar === '' ? 'selected' : ''}`}
                                        onClick={() => setEditAvatar('')}
                                    >
                                        <div className="avatar-placeholder sm"><User size={24} /></div>
                                        {editAvatar === '' && <Check className="avatar-check" size={16} />}
                                    </div>
                                    {avatarPresets.map((preset, idx) => (
                                        <div
                                            key={idx}
                                            className={`avatar-option ${editAvatar === preset ? 'selected' : ''}`}
                                            onClick={() => setEditAvatar(preset)}
                                        >
                                            <img src={preset} alt={`Avatar option ${idx + 1}`} />
                                            {editAvatar === preset && <Check className="avatar-check" size={16} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="edit-modal-footer">
                            <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                            <button
                                className="save-btn"
                                onClick={handleSaveProfile}
                                disabled={isSaving || !editUsername.trim()}
                            >
                                {isSaving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="profile-stats-grid">
                <div className="profile-stat-card stat-score">
                    <Shield size={24} />
                    <div className="stat-value">{score}</div>
                    <div className="stat-label">Cyber Score</div>
                </div>
                <div className="profile-stat-card stat-xp">
                    <Zap size={24} />
                    <div className="stat-value">{xp}</div>
                    <div className="stat-label">Total XP</div>
                </div>
                <div className="profile-stat-card stat-scenarios">
                    <Target size={24} />
                    <div className="stat-value">{completedScenarios.length}</div>
                    <div className="stat-label">Scenarios Done</div>
                </div>
                <div className="profile-stat-card stat-badges">
                    <Award size={24} />
                    <div className="stat-value">{earnedBadges.length}</div>
                    <div className="stat-label">Badges Earned</div>
                </div>
            </div>

            {/* XP Progress */}
            <div className="xp-section">
                <div className="xp-header">
                    <span>Level {level}</span>
                    <span>{xpToNext} XP to Level {level + 1}</span>
                </div>
                <div className="xp-bar">
                    <div className="xp-fill" style={{ width: `${xpProgress}%` }}></div>
                </div>
            </div>

            {/* Badges Section */}
            <div className="badges-section">
                <h2><Star size={20} /> Badges & Achievements</h2>
                <div className="badges-grid">
                    {allBadges.map(badge => (
                        <div key={badge.id} className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}>
                            <div className="badge-icon">
                                <Award size={28} />
                            </div>
                            <div className="badge-info">
                                <h3>{badge.name}</h3>
                                <p>{badge.description}</p>
                            </div>
                            {!badge.earned && <div className="badge-lock">🔒</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Profile;
