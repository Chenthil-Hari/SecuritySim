import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { Shield, Zap, Award, Target, Calendar, Star, User, Edit2, X, Check, MapPin, Upload } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import { getRank } from '../utils/ranks';
import badges from '../data/badges';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import customizations from '../data/customizations';
import { useGameDispatch } from '../context/GameContext';
import { Medal, Crown, Palette, Layout, Sparkles } from 'lucide-react';
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
    const dispatch = useGameDispatch();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'customization'

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setEditError('Image size must be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setEditAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
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

    const handleUpdateCustomization = (update) => {
        dispatch({
            type: 'UPDATE_CUSTOMIZATION',
            payload: update
        });
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

    const activeBanner = customizations.banners.find(b => b.id === (gameState.customization?.activeBanner || 'default'));
    const auraConfig = gameState.customization?.auraEnabled ? (
        profileData?.rank === 1 ? customizations.auras.rank1 :
            profileData?.rank <= 10 ? customizations.auras.top10 :
                profileData?.rank <= 50 ? customizations.auras.top50 :
                    customizations.auras.default
    ) : customizations.auras.default;

    return (
        <div className="profile-container">
            {/* Banner Background */}
            <div className="profile-banner-bg" style={activeBanner?.style}></div>

            {/* Profile Header */}
            <div className="profile-header">
                <div className={`profile-avatar ${gameState.customization?.auraEnabled ? 'has-aura' : ''}`}
                    style={{ '--aura-color': auraConfig.color, '--aura-blur': auraConfig.blur }}>
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
                        {gameState.unlockedTitles?.length > 0 && (
                            <span className="agent-title-display">{gameState.unlockedTitles[gameState.unlockedTitles.length - 1]}</span>
                        )}
                        <button className="edit-profile-btn" onClick={openEditModal}>
                            <Edit2 size={16} /> Edit Profile
                        </button>
                    </div>
                    <p className="profile-email">{user.email}</p>
                    <div className="profile-meta">
                        <span className="rank-badge" style={{ color: getRank(level).color }}>{getRank(level).icon} {getRank(level).title}</span>
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
                                    <div className={`avatar-option ${editAvatar && !avatarPresets.includes(editAvatar) ? 'selected' : ''}`} onClick={() => document.getElementById('avatar-upload').click()}>
                                        {editAvatar && !avatarPresets.includes(editAvatar) ? (
                                            <img src={editAvatar} alt="Custom upload" />
                                        ) : (
                                            <div className="avatar-placeholder sm" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '2px dashed var(--border-color)' }}>
                                                <Upload size={20} />
                                            </div>
                                        )}
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        {editAvatar && !avatarPresets.includes(editAvatar) && <Check className="avatar-check" size={16} />}
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

            {/* Tabs */}
            <div className="profile-tabs">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <Layout size={18} /> Overview
                </button>
                <button
                    className={`tab-btn ${activeTab === 'customization' ? 'active' : ''}`}
                    onClick={() => setActiveTab('customization')}
                >
                    <Palette size={18} /> Customization
                </button>
            </div>

            {activeTab === 'overview' ? (
                <>
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

                    {/* Trophy Room & Medals */}
                    {gameState.seasonalMedals?.length > 0 && (
                        <div className="trophy-room-section">
                            <h2><Medal size={20} /> Trophy Room</h2>
                            <div className="medals-grid">
                                {gameState.seasonalMedals.map((medal, idx) => (
                                    <div key={idx} className={`medal-item ${medal.type}`}>
                                        <Crown size={32} />
                                        <div className="medal-info">
                                            <div className="medal-name">Season Winner: {medal.season}</div>
                                            <div className="medal-type">{medal.type.toUpperCase()} MEDAL</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                </>
            ) : (
                <div className="customization-panel">
                    <div className="cust-section">
                        <h3><Sparkles size={18} /> Profile Aura</h3>
                        <p className="cust-desc">Project a holographic neon field around your agent avatar based on your global rank.</p>
                        <div className="toggle-row">
                            <span>Enable Cyber-Glow Aura</span>
                            <button
                                className={`toggle-switch ${gameState.customization?.auraEnabled ? 'on' : ''}`}
                                onClick={() => handleUpdateCustomization({ auraEnabled: !gameState.customization?.auraEnabled })}
                            >
                                <div className="switch-handle"></div>
                            </button>
                        </div>
                    </div>

                    <div className="cust-section">
                        <h3><Crown size={18} /> Matrix Protocol</h3>
                        <p className="cust-desc">Activate the falling code sequence across your entire terminal. (Exclusive to Top 10 Agents)</p>
                        <div className={`toggle-row ${profileData?.rank > 10 ? 'locked' : ''}`}>
                            <span>Enable Matrix Background</span>
                            <button
                                className={`toggle-switch ${gameState.customization?.matrixEnabled ? 'on' : ''}`}
                                onClick={() => profileData?.rank <= 10 && handleUpdateCustomization({ matrixEnabled: !gameState.customization?.matrixEnabled })}
                                disabled={profileData?.rank > 10}
                            >
                                <div className="switch-handle"></div>
                                {profileData?.rank > 10 && <X size={12} className="switch-lock" />}
                            </button>
                        </div>
                    </div>

                    <div className="cust-section">
                        <h3><Palette size={18} /> Agent Banners</h3>
                        <p className="cust-desc">Customize your profile header with exclusive tactical patterns.</p>
                        <div className="banners-grid">
                            {customizations.banners.map(banner => {
                                const isUnlocked = banner.id === 'default' || banner.condition?.(gameState) || (banner.id === 'matrix-elite' && profileData?.rank <= 10) || (banner.id === 'gold-champion' && profileData?.rank === 1);
                                return (
                                    <div
                                        key={banner.id}
                                        className={`banner-option-card ${gameState.customization?.activeBanner === banner.id ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
                                        onClick={() => isUnlocked && handleUpdateCustomization({ activeBanner: banner.id })}
                                    >
                                        <div className="banner-preview" style={banner.style}></div>
                                        <div className="banner-opt-info">
                                            <span className="banner-name">{banner.name}</span>
                                            {!isUnlocked && <span className="banner-req">{banner.requirement}</span>}
                                        </div>
                                        {gameState.customization?.activeBanner === banner.id && <Check size={16} className="active-check" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
