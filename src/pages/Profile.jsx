import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { User, Mail, Shield, Award, Calendar, ChevronRight, Pencil, Check, X, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Profile.css';

export default function Profile() {
    const { user, updateUserProfile } = useAuth();
    const { score, level, xp, badges, completedScenarios } = useGame();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhotoURL, setEditPhotoURL] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!user) {
        return null;
    }

    // Determine rank based on level
    const getRankInfo = (level) => {
        if (level >= 10) return { title: 'Cyber Master', color: 'var(--primary)' };
        if (level >= 7) return { title: 'Security Expert', color: 'var(--accent-purple)' };
        if (level >= 4) return { title: 'Defense Analyst', color: 'var(--accent-cyan)' };
        if (level >= 2) return { title: 'Junior Defender', color: 'var(--accent-pink)' };
        return { title: 'Novice Trainee', color: 'var(--text-secondary)' };
    };

    const rank = getRankInfo(level);
    const displayName = user.displayName || user.name || (user.email ? user.email.split('@')[0] : 'User');

    const startEditing = () => {
        setEditName(user.displayName || '');
        setEditPhotoURL(user.photoURL || '');
        setIsEditing(true);
        setSaveStatus('');
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setSaveStatus('');
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('');
        try {
            const updates = {};
            if (editName.trim()) updates.displayName = editName.trim();
            if (editPhotoURL.trim()) updates.photoURL = editPhotoURL.trim();

            await updateUserProfile(updates);
            setIsEditing(false);
            setSaveStatus('Profile updated successfully!');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (err) {
            console.error("Profile update error:", err);
            setSaveStatus('Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-cover"></div>
                <div className="profile-info-container">
                    <div className="profile-avatar">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt={displayName} />
                        ) : (
                            <User size={48} />
                        )}
                        {isEditing && (
                            <div className="avatar-edit-overlay">
                                <Camera size={20} />
                            </div>
                        )}
                    </div>
                    <div className="profile-details">
                        {!isEditing ? (
                            <>
                                <div className="profile-name-row">
                                    <h1>{displayName}</h1>
                                    <button className="edit-profile-btn" onClick={startEditing} title="Edit Profile">
                                        <Pencil size={16} />
                                        Edit Profile
                                    </button>
                                </div>
                                {saveStatus && (
                                    <div className={`save-status ${saveStatus.includes('Failed') ? 'error' : 'success'}`}>
                                        {saveStatus}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="profile-edit-form">
                                <div className="edit-field">
                                    <label>Display Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div className="edit-field">
                                    <label>Photo URL</label>
                                    <input
                                        type="url"
                                        value={editPhotoURL}
                                        onChange={(e) => setEditPhotoURL(e.target.value)}
                                        placeholder="https://example.com/photo.jpg"
                                    />
                                </div>
                                <div className="edit-actions">
                                    <button className="btn-primary save-btn" onClick={handleSave} disabled={isSaving}>
                                        <Check size={16} />
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button className="btn-outline cancel-btn" onClick={cancelEditing} disabled={isSaving}>
                                        <X size={16} />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="profile-meta">
                            <span className="profile-email">
                                <Mail size={14} />
                                {user.email || 'No email provided'}
                            </span>
                            <span className="profile-rank" style={{ color: rank.color, borderColor: rank.color }}>
                                <Shield size={14} />
                                {rank.title}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-grid">
                <div className="profile-sidebar">
                    <div className="profile-card stats-card">
                        <h3>Training Stats</h3>

                        <div className="stat-row">
                            <span className="stat-label">Safety Score</span>
                            <span className="stat-value highlight">{score}/100</span>
                        </div>

                        <div className="stat-row">
                            <span className="stat-label">Current Level</span>
                            <span className="stat-value">{level}</span>
                        </div>

                        <div className="stat-row">
                            <span className="stat-label">Total XP</span>
                            <span className="stat-value">{xp}</span>
                        </div>

                        <div className="stat-row">
                            <span className="stat-label">Scenarios Finished</span>
                            <span className="stat-value">{completedScenarios.length}</span>
                        </div>

                        <div className="stat-row">
                            <span className="stat-label">Badges Earned</span>
                            <span className="stat-value">{badges.length}</span>
                        </div>

                        <div className="profile-action">
                            <Link to="/dashboard" className="btn-outline">
                                View Full Dashboard
                            </Link>
                        </div>
                    </div>

                    <div className="profile-card account-details">
                        <h3>Account Info</h3>
                        <div className="detail-item">
                            <span className="detail-label">Provider</span>
                            <span className="detail-value" style={{ textTransform: 'capitalize' }}>
                                {user.provider === 'google' ? 'Google' : 'Email/Password'}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Member Since</span>
                            <span className="detail-value">
                                {user.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString()
                                    : 'Recently'}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Last Login</span>
                            <span className="detail-value">
                                {user.updatedAt
                                    ? new Date(user.updatedAt).toLocaleDateString()
                                    : 'Today'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="profile-main">
                    <div className="profile-card recent-activity">
                        <div className="card-header">
                            <h3>Recent Scenarios</h3>
                            <Link to="/scenarios" className="view-all">Browse all <ChevronRight size={16} /></Link>
                        </div>

                        {completedScenarios.length > 0 ? (
                            <div className="activity-list">
                                {completedScenarios.slice(-5).reverse().map((scenario, idx) => (
                                    <div key={idx} className="activity-item">
                                        <div className="activity-icon">
                                            <Shield size={20} />
                                        </div>
                                        <div className="activity-content">
                                            <h4>{scenario.scenarioId.replace('-', ' ')}</h4>
                                            <span className="activity-category">{scenario.category}</span>
                                        </div>
                                        <div className="activity-result">
                                            <div className="accuracy">
                                                Accuracy: <span style={{ color: scenario.accuracy >= 80 ? 'var(--primary)' : scenario.accuracy >= 50 ? '#ffb300' : '#ff5252' }}>{scenario.accuracy}%</span>
                                            </div>
                                            <div className="date">
                                                {new Date(scenario.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Calendar size={40} />
                                <p>You haven't completed any scenarios yet.</p>
                                <Link to="/scenarios" className="btn-primary" style={{ marginTop: '1rem' }}>
                                    Start Training
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="profile-card latest-badges">
                        <div className="card-header">
                            <h3>Latest Rewards</h3>
                            <Link to="/achievements" className="view-all">View all <ChevronRight size={16} /></Link>
                        </div>

                        {badges.length > 0 ? (
                            <div className="badges-grid-small">
                                {badges.slice(-4).reverse().map((badge, idx) => (
                                    <div key={idx} className="badge-item-small">
                                        <div className="badge-icon-small">
                                            <Award size={24} />
                                        </div>
                                        <span className="badge-name">{badge.replace('-', ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Award size={40} />
                                <p>Complete scenarios to earn your first badge!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
