import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, Eye, AlertCircle, Clock, Search, LogOut, ExternalLink, Lock, BarChart2, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../utils/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('moderation'); // 'moderation', 'users', 'analytics', 'operations'
    const [scenarios, setScenarios] = useState([]);
    const [users, setUsers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [logs, setLogs] = useState([]);
    const [broadcast, setBroadcast] = useState({ message: '', type: 'info' });
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ pending: 0, totalUsers: 0 });
    const [activeScenario, setActiveScenario] = useState(null);
    const [moderationView, setModerationView] = useState('pending'); // 'pending' or 'live'
    const [liveScenarios, setLiveScenarios] = useState([]);

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/admin');
            return;
        }
        
        const fetchData = () => {
            if (activeTab === 'moderation') {
                fetchPending();
                fetchLiveScenarios();
            }
            else if (activeTab === 'users') fetchUsers();
            else if (activeTab === 'analytics') fetchAnalytics();
            else if (activeTab === 'operations') {
                fetchLogs();
            }
        };

        fetchData();
    }, [user, navigate, activeTab]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/admin/stats'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setAnalytics(await res.json());
        } catch (err) {
            console.error("Analytics Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/admin/logs'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setLogs(await res.json());
        } catch (err) {
            console.error("Log Error:", err);
        } finally {
            setLoading(false);
        }
    };


    const handleBroadcast = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/admin/broadcast'), {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(broadcast)
            });
            if (res.ok) {
                alert("Global Alert Deployed!");
                setBroadcast({ ...broadcast, message: '' });
                fetchLogs();
            }
        } catch (err) {
            alert("Broadcast Error: " + err.message);
        }
    };


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

    const fetchLiveScenarios = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/ugc-scenarios/admin/live'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLiveScenarios(data);
            }
        } catch (err) {
            console.error("Error fetching live scenarios:", err);
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

    const handleDeleteLog = async (logId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl(`/api/admin/logs/${logId}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setLogs(logs.filter(l => l._id !== logId));
            }
        } catch (err) {
            console.error("Error deleting log:", err);
        }
    };

    const handleClearLogs = async () => {
        if (!confirm("CRITICAL ACTION: Are you sure you want to PERMANENTLY ERASE all audit logs? This cannot be undone.")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/admin/logs'), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchLogs(); // Refresh to show the 'clear_logs' action just taken
                alert("Audit logs cleared successfully.");
            }
        } catch (err) {
            alert("Error clearing logs: " + err.message);
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
                const action = status === 'approved' ? 'Approved' : 'Rejected';
                alert(`Scenario ${action} and updated successfully.`);
            }
        } catch (err) {
            alert("Error moderating scenario: " + err.message);
        }
    };

    const handleToggleBounty = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl(`/api/ugc-scenarios/admin/${id}/bounty`), {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLiveScenarios(liveScenarios.map(s => s._id === id ? { ...s, isBountied: data.isBountied } : s));
            }
        } catch (err) {
            alert("Error toggling bounty: " + err.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };

    if (user?.role !== 'admin') return null;

    const renderHeader = () => (
        <header className="main-header">
            <div className="header-title">
                <h1>
                    {activeTab === 'moderation' && 'Scenario Management'}
                    {activeTab === 'users' && 'User Directory'}
                    {activeTab === 'analytics' && 'Intelligence Dashboard'}
                    {activeTab === 'operations' && 'Mission Operations'}
                </h1>
                <p>
                    {activeTab === 'moderation' && `Total pending scenarios: ${stats.pending} | Live: ${liveScenarios.length}`}
                    {activeTab === 'users' && `Total registered investigators: ${stats.totalUsers}`}
                    {activeTab === 'analytics' && 'Real-time platform performance metrics.'}
                    {activeTab === 'operations' && 'Administrative controls and security logs.'}
                </p>
            </div>
            {activeTab === 'users' && (
                <div className="header-search">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by username..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}
            <button className="refresh-btn" onClick={() => {
                if (activeTab === 'moderation') { fetchPending(); fetchLiveScenarios(); }
                else if (activeTab === 'users') fetchUsers();
                else if (activeTab === 'analytics') fetchAnalytics();
                else if (activeTab === 'operations') fetchLogs();
            }}>Refresh</button>
        </header>
    );

    const renderModeration = () => (
        <div className="moderation-container animate-fade-in">
            <div className="moderation-tabs">
                <button 
                    className={`mod-tab ${moderationView === 'pending' ? 'active' : ''}`}
                    onClick={() => setModerationView('pending')}
                >
                    Pending Queue ({stats.pending})
                </button>
                <button 
                    className={`mod-tab ${moderationView === 'live' ? 'active' : ''}`}
                    onClick={() => setModerationView('live')}
                >
                    Live Scenarios ({liveScenarios.length})
                </button>
            </div>

            {moderationView === 'pending' ? (
                scenarios.length > 0 ? (
                    <div className="scenario-queue">
                        {scenarios.map(s => (
                            <div key={s._id} className="queue-card">
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
                        <p>There are no pending scenarios to moderate.</p>
                    </div>
                )
            ) : (
                <div className="scenario-queue">
                    {liveScenarios.map(s => (
                        <div key={s._id} className={`queue-card ${s.isBountied ? 'bountied-border' : ''}`}>
                            <div className="queue-card-main">
                                <div className="scenario-identity">
                                    <span className={`cat-tag ${s.category.toLowerCase()}`}>{s.category}</span>
                                    {s.isBountied && <span className="cat-tag" style={{ background: 'var(--accent)', marginLeft: '10px' }}>BOUNTY ACTIVE</span>}
                                    <h3>{s.title}</h3>
                                    <p>{s.description}</p>
                                </div>
                                <div className="scenario-meta">
                                    <div className="meta-item">
                                        <span>Author</span>
                                        <strong>{s.authorId?.username || 'Unknown'}</strong>
                                    </div>
                                    <div className="meta-item">
                                        <span>Total Plays</span>
                                        <strong>{s.plays || 0}</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="queue-card-actions">
                                <button 
                                    className={`btn-bounty ${s.isBountied ? 'active' : ''}`} 
                                    onClick={() => handleToggleBounty(s._id, s.isBountied)}
                                >
                                    <Star size={16} /> {s.isBountied ? 'Revoke Bounty' : 'Set 2x XP Bounty'}
                                </button>
                                <button className="btn-reject" onClick={() => handleModerate(s._id, 'rejected')}>
                                    <AlertCircle size={16} /> Takedown
                                </button>
                            </div>
                        </div>
                    ))}
                    {liveScenarios.length === 0 && (
                        <div className="queue-empty">
                            <p>No live UGC scenarios yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderUsers = () => (
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
                                    title={u.isFrozen ? 'Unfreeze' : 'Freeze'}
                                >
                                    <AlertCircle size={16} />
                                </button>
                                <button 
                                    className="action-btn reset"
                                    onClick={() => handleResetPassword(u._id)}
                                    title="Reset Password"
                                >
                                    <Lock size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderAnalytics = () => (
        <div className="admin-analytics animate-fade-in">
            <div className="analytics-grid">
                <div className="stat-card large">
                    <h3>User Growth (Last 7 Days)</h3>
                    <div className="chart-placeholder">
                        {analytics?.registrations.map(r => (
                            <div key={r._id} className="chart-bar-container">
                                <div className="chart-bar" style={{ height: `${(r.count / Math.max(...analytics.registrations.map(x => x.count), 1)) * 100}%` }}>
                                    <span className="count">{r.count}</span>
                                </div>
                                <span className="date">{r._id.split('-').slice(1).join('/')}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="stat-card">
                    <h3>Kill-Chain Stats (Avg. Accuracy)</h3>
                    <div className="category-list">
                        {analytics?.categoryStats.map(c => (
                            <div key={c._id} className="cat-item">
                                <span className="cat-name">{c._id}</span>
                                <div className="progress-bg">
                                    <div 
                                        className={`progress-bar ${c.avgAccuracy < 60 ? 'danger' : c.avgAccuracy < 80 ? 'warning' : 'success'}`} 
                                        style={{ width: `${c.avgAccuracy}%` }}
                                    ></div>
                                </div>
                                <strong className="accuracy-val">{Math.round(c.avgAccuracy)}%</strong>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="stat-card">
                    <h3>Top Active Locales</h3>
                    <div className="country-list">
                        {analytics?.countries.map(c => (
                            <div key={c._id} className="country-item">
                                <Shield size={14} className="text-muted" />
                                <span>{c._id || 'Undisclosed'}</span>
                                <strong className="count-val">{c.count}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderOperations = () => (
        <div className="admin-ops animate-fade-in">
            <div className="ops-grid">
                <div className="ops-card">
                    <h3><Radio size={18} /> Global Broadcast</h3>
                    <form onSubmit={handleBroadcast}>
                        <textarea 
                            placeholder="Message to all terminals..."
                            value={broadcast.message}
                            onChange={e => setBroadcast({...broadcast, message: e.target.value})}
                        />
                        <div className="form-actions">
                            <select value={broadcast.type} onChange={e => setBroadcast({...broadcast, type: e.target.value})}>
                                <option value="info">Information</option>
                                <option value="warning">Warning</option>
                                <option value="danger">CRITICAL</option>
                            </select>
                            <button type="submit" className="btn-broadcast">Deploy</button>
                        </div>
                    </form>
                </div>
                <div className="audit-log-card">
                    <div className="card-header-with-action">
                        <h3>Audit Logs</h3>
                        <button className="btn-clear-logs" onClick={handleClearLogs}>
                            <XCircle size={14} /> Clear All History
                        </button>
                    </div>
                    <div className="log-list">
                        {logs.map(log => (
                            <div key={log._id} className="log-entry">
                                <span className="time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                <span className="admin">{log.adminName}</span>
                                <span className="action">{log.action}</span>
                                <p className="desc">{log.details}</p>
                                <button className="btn-delete-log" onClick={() => handleDeleteLog(log._id)} title="Remove Log Entry">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="admin-dashboard-page">
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <Shield size={24} className="text-primary" />
                    <span>HQ ADMIN</span>
                </div>
                
                <nav className="sidebar-nav">
                    <button className={`nav-item ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}>
                        <Clock size={18} /> Moderation Queue
                    </button>
                    <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <Shield size={18} /> User Directory
                    </button>
                    <button className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                        <BarChart2 size={18} /> Analytics
                    </button>
                    <button className={`nav-item ${activeTab === 'operations' ? 'active' : ''}`} onClick={() => setActiveTab('operations')}>
                        <Radio size={18} /> Operations
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
                {renderHeader()}
                <div className="dashboard-content">
                    {loading ? (
                        <div className="admin-loading">Initializing Terminal...</div>
                    ) : (
                        <>
                            {activeTab === 'moderation' && renderModeration()}
                            {activeTab === 'users' && renderUsers()}
                            {activeTab === 'analytics' && renderAnalytics()}
                            {activeTab === 'operations' && renderOperations()}
                        </>
                    )}
                </div>
            </main>

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
                                    {JSON.stringify(activeScenario.content?.visualData, null, 2)}
                                </pre>
                            </div>
                            <div className="review-section">
                                <h3>Decision Path</h3>
                                <div className="options-preview">
                                    {activeScenario.content?.options.map((opt, i) => (
                                        <div key={i} className={`opt-preview ${opt.isCorrect ? 'correct' : 'mistake'}`}>
                                            <strong>{opt.isCorrect ? 'Correct:' : 'Trap:'}</strong> {opt.text}
                                            <p className="feedback">{opt.feedback}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="review-section">
                                <h3>Educational Summary</h3>
                                <p className="explanation">{activeScenario.content?.educationalExplanation}</p>
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
