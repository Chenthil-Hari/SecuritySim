import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, Eye, AlertCircle, Clock, Search, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../utils/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('moderation'); // 'moderation' or 'users'
    const [scenarios, setScenarios] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ pending: 0, totalUsers: 0 });
    const [activeScenario, setActiveScenario] = useState(null);

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/admin');
            return;
        }
        if (activeTab === 'moderation') {
            fetchPending();
        } else {
            fetchUsers();
        }
    }, [user, navigate, activeTab]);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/ugc-scenarios/admin/pending'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setScenarios(data);
                setStats(prev => ({ ...prev, pending: data.length }));
            }
        } catch (err) {
            console.error("Error fetching pending:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/users/admin/all'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
                setStats(prev => ({ ...prev, totalUsers: data.length }));
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFreeze = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl(`/api/users/admin/${userId}/freeze`), {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(users.map(u => u._id === userId ? { ...u, isFrozen: data.isFrozen } : u));
                alert(data.message);
            }
        } catch (err) {
            alert("Error updating user status: " + err.message);
        }
    };

    const handleResetPassword = async (userId) => {
        if (!confirm("Are you sure you want to reset this user's password? A temporary password will be generated.")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl(`/api/users/admin/${userId}/reset-password`), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                alert(`Password Reset Successful!\nTemporary Password: ${data.tempPassword}\n\nPlease provide this to the user.`);
            }
        } catch (err) {
            alert("Error resetting password: " + err.message);
        }
    };

    const handleModerate = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl(`/api/ugc-scenarios/${id}/moderate`), {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setScenarios(scenarios.filter(s => s._id !== id));
                setStats(prev => ({ ...prev, pending: prev.pending - 1 }));
                setActiveScenario(null);
                // Simple success feedback
                const action = status === 'approved' ? 'Approved' : 'Rejected';
                alert(`Scenario ${action} and updated successfully.`);
            }
        } catch (err) {
            alert("Error moderating scenario: " + err.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };

    if (user?.role !== 'admin') return null;

    return (
        <div className="admin-dashboard-page">
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <Shield size={24} className="text-primary" />
                    <span>HQ ADMIN</span>
                </div>
                
                <nav className="sidebar-nav">
                    <button 
                        className={`nav-item ${activeTab === 'moderation' ? 'active' : ''}`}
                        onClick={() => setActiveTab('moderation')}
                    >
                        <Clock size={18} /> Moderation Queue
                        {stats.pending > 0 && <span className="badge">{stats.pending}</span>}
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Shield size={18} /> User Directory
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">{user.username[0]}</div>
                        <div className="user-details">
                            <span className="username">{user.username}</span>
                            <span className="role">Administrator</span>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="main-header">
                    <div className="header-title">
                        <h1>{activeTab === 'moderation' ? 'Moderation Queue' : 'User & Security Management'}</h1>
                        <p>
                            {activeTab === 'moderation' 
                                ? `Total pending scenarios awaiting review: ${stats.pending}` 
                                : `Total registered investigators: ${stats.totalUsers}`}
                        </p>
                    </div>
                    {activeTab === 'users' && (
                        <div className="header-search">
                            <Search size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by username or ID..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                    <button className="refresh-btn" onClick={activeTab === 'moderation' ? fetchPending : fetchUsers}>Refresh</button>
                </header>

                <div className="dashboard-content">
                    {loading ? (
                        <div className="admin-loading">Initializing Terminal...</div>
                    ) : activeTab === 'moderation' ? (
                        scenarios.length > 0 ? (
                            <div className="scenario-queue">
                                {scenarios.map(s => (
                                    <div key={s._id} className="queue-card animate-fade-in">
                                        <div className="queue-card-main">
                                            <div className="scenario-identity">
                                                <span className={`cat-tag ${s.category.toLowerCase()}`}>{s.category}</span>
                                                <h3>{s.title}</h3>
                                                <p>{s.description}</p>
                                            </div>
                                            <div className="scenario-meta">
                                                <div className="meta-item">
                                                    <span>Author</span>
                                                    <strong>{s.authorId?.username || 'Unknown'}</strong>
                                                </div>
                                                <div className="meta-item">
                                                    <span>Difficulty</span>
                                                    <strong className={s.difficulty.toLowerCase()}>{s.difficulty}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="queue-card-actions">
                                            <button className="btn-view" onClick={() => setActiveScenario(s)}>
                                                <Eye size={16} /> Review
                                            </button>
                                            <button className="btn-approve" onClick={() => handleModerate(s._id, 'approved')}>
                                                <CheckCircle size={16} /> Approve
                                            </button>
                                            <button className="btn-reject" onClick={() => handleModerate(s._id, 'rejected')}>
                                                <XCircle size={16} /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="queue-empty">
                                <CheckCircle size={48} className="text-success" />
                                <h2>All Caught Up!</h2>
                                <p>There are no pending scenarios to moderate at this time.</p>
                            </div>
                        )
                    ) : (
                        <div className="user-management">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Investigator</th>
                                        <th>Level / XP</th>
                                        <th>Team</th>
                                        <th>Joined</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                                        <tr key={u._id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar">{u.username[0]}</div>
                                                    <div className="user-text">
                                                        <span className="username">{u.username}</span>
                                                        <span className="user-id">{u._id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="xp-cell">
                                                    Lvl {u.level}
                                                    <span className="xp-pills">{u.xp} XP</span>
                                                </div>
                                            </td>
                                            <td>{u.teamId?.name || <span className="text-muted">No Team</span>}</td>
                                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`status-badge ${u.isFrozen ? 'frozen' : 'active'}`}>
                                                    {u.isFrozen ? 'Terminal Locked' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                <button 
                                                    className={`action-btn ${u.isFrozen ? 'unfreeze' : 'freeze'}`}
                                                    onClick={() => handleFreeze(u._id)}
                                                    title={u.isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
                                                >
                                                    <AlertCircle size={16} />
                                                </button>
                                                <button 
                                                    className="action-btn reset"
                                                    onClick={() => handleResetPassword(u._id)}
                                                    title="Reset Terminal Password"
                                                >
                                                    <Lock size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Review Overlay */}
            {activeScenario && (
                <div className="review-overlay" onClick={() => setActiveScenario(null)}>
                    <div className="review-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Review: {activeScenario.title}</h2>
                            <button className="close-btn" onClick={() => setActiveScenario(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="review-section author-info-section">
                                <h3>Author Details</h3>
                                <div className="author-card">
                                    <div className="author-avatar">
                                        {activeScenario.authorId?.profilePhoto ? (
                                            <img src={activeScenario.authorId.profilePhoto} alt="" />
                                        ) : (
                                            <span>{activeScenario.authorId?.username?.[0] || '?'}</span>
                                        )}
                                    </div>
                                    <div className="author-text">
                                        <strong>{activeScenario.authorId?.username || 'Unknown User'}</strong>
                                        <span className="author-email">{activeScenario.authorId?.email || 'No email provided'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="review-section">
                                <h3>Visual Content</h3>
                                <pre className="content-preview">
                                    {JSON.stringify(activeScenario.content.visualData, null, 2)}
                                </pre>
                            </div>
                            <div className="review-section">
                                <h3>Decision Path</h3>
                                <div className="options-preview">
                                    {activeScenario.content.options.map((opt, i) => (
                                        <div key={i} className={`opt-preview ${opt.isCorrect ? 'correct' : 'mistake'}`}>
                                            <strong>{opt.isCorrect ? 'Correct:' : 'Trap:'}</strong> {opt.text}
                                            <p className="feedback">{opt.feedback}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="review-section">
                                <h3>Educational Summary</h3>
                                <p className="explanation">{activeScenario.content.educationalExplanation}</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-reject" onClick={() => handleModerate(activeScenario._id, 'rejected')}>Reject Scenario</button>
                            <button className="btn-approve" onClick={() => handleModerate(activeScenario._id, 'approved')}>Approve Scenario</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
