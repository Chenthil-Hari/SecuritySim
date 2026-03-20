import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame, useGameDispatch } from '../context/GameContext';
import { Shield, Zap, Award, Target, Calendar, Star, User, Edit2, X, Check, MapPin, Upload, UserPlus, UserCheck, UserMinus, Search, MessageSquare, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { buildApiUrl } from '../utils/api';
import { getRank } from '../utils/ranks';
import badges from '../data/badges';
import Loader from '../components/Loader';
import customizations from '../data/customizations';
import AgentIDCard from '../components/AgentIDCard';
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
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const gameState = useGame();
    const dispatch = useGameDispatch();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'customization', 'social'
    const [isOwnProfile, setIsOwnProfile] = useState(true);

    // Social State
    const [friendStatus, setFriendStatus] = useState('none'); // 'none', 'pending', 'friends'
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSocialLoading, setIsSocialLoading] = useState(false);

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [editUsername, setEditUsername] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [editCountry, setEditCountry] = useState('Global');
    const [editError, setEditError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const isPersonal = !userId || userId === user?._id;
                setIsOwnProfile(isPersonal);

                const profileUrl = isPersonal ? buildApiUrl('/api/profile/me') : buildApiUrl(`/api/profile/${userId}`);

                const response = await fetch(profileUrl, {
                    headers: { Authorization: token ? `Bearer ${token}` : '' }
                });

                if (response.ok) {
                    const data = await response.json();
                    setProfileData(data);

                    if (data.friendStatus) {
                        setFriendStatus(data.friendStatus);
                    } else if (!isPersonal && user) {
                        // Fallback check friend status if needed, though server should provide it
                        const token = localStorage.getItem('token');
                        const friendsRes = await fetch(buildApiUrl('/api/friends'), {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (friendsRes.ok) {
                            const friendsList = await friendsRes.json();
                            const isFriend = friendsList.some(f => f._id === userId);
                            if (isFriend) {
                                setFriendStatus('friends');
                            } else {
                                setFriendStatus('none');
                            }
                        }
                    }
                } else if (response.status === 404) {
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId, user?._id, navigate]);

    useEffect(() => {
        if (isOwnProfile && activeTab === 'social' && user) {
            fetchSocialData();
        }
    }, [activeTab, isOwnProfile, user]);

    const fetchSocialData = async () => {
        setIsSocialLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [friendsRes, requestsRes] = await Promise.all([
                fetch(buildApiUrl('/api/friends'), { headers: { Authorization: `Bearer ${token}` } }),
                fetch(buildApiUrl('/api/friends/requests'), { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (friendsRes.ok) setFriends(await friendsRes.json());
            if (requestsRes.ok) setFriendRequests(await requestsRes.json());
        } catch (err) {
            console.error('Error fetching social data:', err);
        } finally {
            setIsSocialLoading(false);
        }
    };

    const openEditModal = () => {
        setEditUsername(user?.username || '');
        setEditAvatar(profileData?.profilePhoto || '');
        setEditCountry(user?.country || 'Global');
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
                    username: editUsername !== user?.username ? editUsername : undefined,
                    profilePhoto: editAvatar !== profileData?.profilePhoto ? editAvatar : undefined,
                    country: editCountry !== (user?.country || 'Global') ? editCountry : undefined
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

    const handleVerifyEmail = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/auth/resend-otp'), {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ email: user?.email })
            });
            if (res.ok) {
                navigate('/verify-email');
            } else {
                alert('Failed to initiate verification sequence.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateCustomization = (update) => {
        dispatch({
            type: 'UPDATE_CUSTOMIZATION',
            payload: update
        });
    };

    const handleAddFriend = async (targetUsername) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl(`/api/friends/request/${targetUsername}`), {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setFriendStatus('pending');
                alert('Friend request sent!');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRespondToRequest = async (requestId, action) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl(`/api/friends/request/${requestId}/respond`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ action })
            });
            if (res.ok) fetchSocialData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUserSearch = async (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl(`/api/profile/search/${query}`), {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setSearchResults(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

    if (!user && isOwnProfile) {
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

    const score = profileData?.score !== undefined ? profileData.score : (isOwnProfile ? (gameState?.score || 0) : 0);
    const xp = profileData?.xp !== undefined ? profileData.xp : (isOwnProfile ? (gameState?.xp || 0) : 0);
    const level = profileData?.level !== undefined ? profileData.level : (isOwnProfile ? (gameState?.level || 1) : 1);
    const earnedBadges = profileData?.badges || (isOwnProfile ? (gameState?.badges || []) : []);
    const memberSince = profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    const xpToNext = 100 - (xp % 100);
    const xpProgress = (xp % 100) / 100 * 100;

    const allBadges = badges.map(b => ({
        ...b,
        earned: earnedBadges.includes(b.id)
    }));

    const activeBanner = customizations.banners.find(b => b.id === (profileData?.customization?.activeBanner || (isOwnProfile ? gameState?.customization?.activeBanner : 'default'))) || customizations.banners[0];
    const auraEnabled = profileData?.customization?.auraEnabled !== undefined ? profileData.customization.auraEnabled : (isOwnProfile ? (gameState?.customization?.auraEnabled || false) : false);
    const auraConfig = (auraEnabled && customizations.auras) ? (
        profileData?.rank === 1 ? customizations.auras.rank1 :
            profileData?.rank <= 10 ? customizations.auras.top10 :
                profileData?.rank <= 50 ? customizations.auras.top50 :
                    customizations.auras.default
    ) : customizations.auras?.default || { color: 'transparent', blur: '0' };

    return (
        <div className="profile-container">
            <div className="page-top-nav">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> Back
                </button>
            </div>
            {/* Banner Background */}
            <div className="profile-banner-bg" style={activeBanner?.style}></div>

            {/* Profile Header */}
            <div className="profile-header">
                <div className={`profile-avatar ${auraEnabled ? 'has-aura' : ''}`}
                    style={{ '--aura-color': auraConfig.color, '--aura-blur': auraConfig.blur }}>
                    {profileData?.profilePhoto ? (
                        <img src={profileData.profilePhoto} alt="Profile" />
                    ) : (
                        <div className="avatar-placeholder">
                            <User size={48} />
                        </div>
                    )}
                    <div className="level-badge">Lv.{profileData?.level || level}</div>
                </div>
                <div className="profile-info">
                    <div className="profile-title-row">
                        <h1>{profileData?.username || user?.username}</h1>
                        {profileData?.unlockedTitles?.length > 0 && (
                            <span className="agent-title-display">{profileData.unlockedTitles[profileData.unlockedTitles.length - 1]}</span>
                        )}
                        {isOwnProfile ? (
                            <button className="edit-profile-btn" onClick={openEditModal}>
                                <Edit2 size={16} /> Edit Profile
                            </button>
                        ) : (
                            <div className="social-actions">
                                {friendStatus === 'friends' ? (
                                    <button className="btn-social friend"><UserCheck size={16} /> Friends</button>
                                ) : friendStatus === 'pending' ? (
                                    <button className="btn-social pending"><Calendar size={16} /> Request Sent</button>
                                ) : (
                                    <button
                                        className="btn-social add"
                                        onClick={() => handleAddFriend(profileData.username)}
                                    >
                                        <UserPlus size={16} /> Add Friend
                                    </button>
                                )}
                                <button className="btn-social msg"><MessageSquare size={16} /></button>
                            </div>
                        )}
                    </div>
                    <p className="profile-email">
                        {isOwnProfile ? user?.email : 'Classified Agent'}
                        {isOwnProfile && (
                            profileData?.isVerified ? (
                                <span className="verification-badge verified"><Shield size={10} /> Verified</span>
                            ) : (
                                <button className="verification-badge unverified" onClick={handleVerifyEmail}>
                                    <Shield size={10} /> Verify Now
                                </button>
                            )
                        )}
                    </p>
                    <div className="profile-meta">
                        <span className="rank-badge" style={{ color: getRank(profileData?.level || level).color }}>{getRank(profileData?.level || level).icon} {getRank(profileData?.level || level).title}</span>
                        <span><MapPin size={14} /> {profileData?.country || 'Global'}</span>
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
                {isOwnProfile && (
                    <>
                        <button
                            className={`tab-btn ${activeTab === 'customization' ? 'active' : ''}`}
                            onClick={() => setActiveTab('customization')}
                        >
                            <Palette size={18} /> Customization
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
                            onClick={() => setActiveTab('social')}
                        >
                            <Search size={18} /> Social & Friends
                        </button>
                    </>
                )}
            </div>

            {activeTab === 'overview' ? (
                <>
                    {/* Interactive Agent ID Card */}
                    <AgentIDCard user={{
                        username: profileData?.username || user?.username,
                        profilePhoto: profileData?.profilePhoto,
                        score: score,
                        xp: xp,
                        level: profileData?.level || level,
                        country: profileData?.country || user?.country,
                        _id: profileData?._id || user?._id
                    }} />

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
                        <div className="profile-stat-card stat-badges">
                            <Award size={24} />
                            <div className="stat-value">{earnedBadges.length}</div>
                            <div className="stat-label">Badges Earned</div>
                        </div>
                    </div>

                    {/* Trophy Room & Medals */}
                    {((profileData?.seasonalMedals || (isOwnProfile ? gameState.seasonalMedals : []))?.length > 0) && (
                        <div className="trophy-room-section">
                            <h2><Medal size={20} /> Trophy Room</h2>
                            <div className="medals-grid">
                                {(profileData?.seasonalMedals || (isOwnProfile ? gameState.seasonalMedals : [])).map((medal, idx) => (
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
            ) : activeTab === 'customization' ? (
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
            ) : (
                <div className="social-panel">
                    <div className="social-top-row">
                        <div className="friend-requests-section">
                            <h3>Friend Requests {friendRequests.length > 0 && <span className="req-count">{friendRequests.length}</span>}</h3>
                            <div className="requests-list">
                                {friendRequests.length === 0 ? (
                                    <p className="empty-msg">No pending requests</p>
                                ) : (
                                    friendRequests.map(req => (
                                        <div key={req._id} className="request-card">
                                            <div className="req-user">
                                                <img src={req.from.profilePhoto || avatarPresets[0]} alt={req.from.username} />
                                                <div className="req-info">
                                                    <span className="req-name">{req.from.username}</span>
                                                    <span className="req-lvl">Lv.{req.from.level}</span>
                                                </div>
                                            </div>
                                            <div className="req-btns">
                                                <button className="req-btn accept" onClick={() => handleRespondToRequest(req._id, 'accept')}><Check size={16} /></button>
                                                <button className="req-btn reject" onClick={() => handleRespondToRequest(req._id, 'reject')}><X size={16} /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="user-search-section">
                            <h3>Find Agents</h3>
                            <div className="search-box">
                                <Search className="search-icon" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by username..."
                                    value={searchTerm}
                                    onChange={handleUserSearch}
                                />
                            </div>
                            <div className="search-results">
                                {searchResults.map(res => (
                                    <div key={res._id} className="search-result-card" onClick={() => navigate(`/profile/${res._id}`)}>
                                        <div className="res-profile">
                                            <img src={res.profilePhoto || avatarPresets[0]} alt={res.username} />
                                            <div className="res-info">
                                                <span className="res-name">{res.username}</span>
                                                <span className="res-meta">Lv.{res.level} • {res.country}</span>
                                            </div>
                                        </div>
                                        <UserPlus size={16} className="add-hint" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="friends-list-section">
                        <h3>Agent Network ({friends.length})</h3>
                        <div className="friends-grid">
                            {friends.length === 0 ? (
                                <div className="no-friends">
                                    <User size={48} />
                                    <p>Your network is empty. Connect with other agents to build your team!</p>
                                </div>
                            ) : (
                                friends.map(friend => (
                                    <div key={friend._id} className="friend-card" onClick={() => navigate(`/profile/${friend._id}`)}>
                                        <img className="friend-avatar" src={friend.profilePhoto || avatarPresets[0]} alt={friend.username} />
                                        <div className="friend-info">
                                            <span className="friend-name">{friend.username}</span>
                                            <span className="friend-rank">{getRank(friend.level).title}</span>
                                            <div className="friend-stats">
                                                <span><Zap size={10} /> {friend.score}</span>
                                                <span><Target size={10} /> {friend.level}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
