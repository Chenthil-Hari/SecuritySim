import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, Eye, AlertCircle, Clock, Search, LogOut, ExternalLink, Lock, BarChart2, Radio, Star, X, Zap, Download, FileText, Activity, Database, RefreshCw, Server, Award } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../utils/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('moderation'); 
    const [scenarios, setScenarios] = useState([]);
    const [users, setUsers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [logs, setLogs] = useState([]);
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', type: 'XP_BOOST', multiplier: 2.0, expiresAt: '' });
    const [broadcast, setBroadcast] = useState({ message: '', type: 'info' });
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ pending: 0, totalUsers: 0 });
    const [activeScenario, setActiveScenario] = useState(null);
    const [moderationView, setModerationView] = useState('pending'); // 'pending' or 'live'
    const [liveScenarios, setLiveScenarios] = useState([]);
    const [assets, setAssets] = useState([]);
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [expectedReturn, setExpectedReturn] = useState('');
    const [featureToggles, setFeatureToggles] = useState({ teams: true, warrooms: true, pvp: true, ugc: true, threat_map: true });
    const [newsItems, setNewsItems] = useState([]);
    const [newNews, setNewNews] = useState({ title: '', message: '', type: 'info', priority: 0, expiresAt: '' });
    const [banModal, setBanModal] = useState({ isOpen: false, userId: null, username: '', reason: '' });
    const [vitals, setVitals] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [adminNameModal, setAdminNameModal] = useState({ isOpen: false, pendingAction: null, actionLabel: '' });
    const [adminDisplayName, setAdminDisplayName] = useState(sessionStorage.getItem('adminDisplayName') || '');
    const [maintenanceDuration, setMaintenanceDuration] = useState('custom');

    const requireAdminName = (actionLabel, callback) => {
        if (adminDisplayName) {
            callback(adminDisplayName);
        } else {
            setAdminNameModal({ isOpen: true, pendingAction: callback, actionLabel });
        }
    };

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
                fetchEvents();
                fetchMaintenanceStatus();
                fetchFeatureToggles();
                fetchNews();
            }
            else if (activeTab === 'evidence') {
                fetchAssets();
            }
            else if (activeTab === 'vitals') {
                fetchVitals();
            }
        };

        fetchData();
    }, [user, navigate, activeTab]);

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/admin/events'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setEvents(await res.json());
        } catch (err) {
            console.error("Failed to fetch events:", err);
        }
    };

    const fetchMaintenanceStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/admin/settings/maintenance'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setIsMaintenanceMode(data.isActive);
                setExpectedReturn(data.expectedReturn || '');
            }
        } catch (err) {
            console.error("Failed to fetch maintenance status:", err);
        }
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/admin/stats'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setAnalytics(await res.json());
                setError(null);
            } else {
                if (res.status === 401) {
                    setError("Session expired. Please log out and back in.");
                    return;
                }
                const text = await res.text().catch(() => '');
                let msg = `Intelligence Error (${res.status})`;
                try {
                    const data = JSON.parse(text);
                    msg = data.message || msg;
                } catch (e) {
                    msg = text ? `${msg}: ${text.substring(0, 50)}` : msg;
                }
                setError(msg);
            }
        } catch (err) {
            console.error("Analytics Error:", err);
            setError("Tactical link offline.");
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
            if (res.ok) {
                setLogs(await res.json());
                setError(null);
            } else {
                if (res.status === 401) {
                    setError("Session expired. Please log out and back in.");
                    return;
                }
                const text = await res.text().catch(() => '');
                let msg = `Ops Log Error (${res.status})`;
                try {
                    const data = JSON.parse(text);
                    msg = data.message || msg;
                } catch (e) {
                    msg = text ? `${msg}: ${text.substring(0, 50)}` : msg;
                }
                setError(msg);
            }
        } catch (err) {
            console.error("Log Error:", err);
            setError("Mission Log link offline.");
        } finally {
            setLoading(false);
        }
    };

    const fetchVitals = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/admin/vitals'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setVitals(await res.json());
        } catch (err) {
            console.error("Vitals Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRecalculateScores = () => {
        requireAdminName('Sync Global Scores', async (adminName) => {
            if (!confirm("This will rebuild level/score parity across all agents and teams. Proceed with global synchronization?")) return;
            setSyncing(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl('/api/admin/vitals/recalculate-scores'), {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminDisplayName: adminName })
                });
                const data = await res.json();
                if (res.ok) {
                    alert(`Success: ${data.message}\nAgents Adjusted: ${data.results.usersAdjusted}\nTeams Adjusted: ${data.results.teamsAdjusted}`);
                    fetchLogs();
                } else {
                    alert("Operation failed: " + data.message);
                }
            } catch (err) {
                alert("Maintenance Error: " + err.message);
            } finally {
                setSyncing(false);
            }
        });
    };

    const handleBroadcast = (e) => {
        e.preventDefault();
        requireAdminName('Deploy Global Alert', async (adminName) => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl('/api/admin/broadcast'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ ...broadcast, adminDisplayName: adminName })
                });
                if (res.ok) {
                    alert("Global Alert Deployed!");
                    setBroadcast({ ...broadcast, message: '' });
                    fetchLogs();
                } else {
                    const data = await res.json().catch(() => ({}));
                    alert(`Broadcast Failed: ${data.message || 'Server error'}`);
                }
            } catch (err) {
                alert("Broadcast Error: " + err.message);
            }
        });
    };

    const fetchFeatureToggles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/admin/settings/features'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setFeatureToggles(await res.json());
        } catch (err) {
            console.error("Failed to fetch toggles:", err);
        }
    };

    const fetchNews = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/admin/news/admin'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setNewsItems(await res.json());
        } catch (err) {
            console.error("Failed to fetch news:", err);
        }
    };

    const handleToggleFeatureFlag = (feature) => {
        requireAdminName(`Toggle Feature: ${feature}`, async (adminName) => {
            const newToggles = { ...featureToggles, [feature]: !featureToggles[feature] };
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl('/api/admin/settings/features'), {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ toggles: newToggles, adminDisplayName: adminName })
                });
                if (res.ok) setFeatureToggles(newToggles);
            } catch (err) {
                alert("Failed to update feature: " + err.message);
            }
        });
    };

    const handleCreateNews = (e) => {
        e.preventDefault();
        requireAdminName('Publish News', async (adminName) => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl('/api/admin/news'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ ...newNews, adminDisplayName: adminName })
                });
                if (res.ok) {
                    alert("News Item Published!");
                    setNewNews({ title: '', message: '', type: 'info', priority: 0, expiresAt: '' });
                    fetchNews();
                }
            } catch (err) {
                alert("Error publishing news: " + err.message);
            }
        });
    };

    const handleToggleNews = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl(`/api/admin/news/${id}/toggle`), {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchNews();
        } catch (err) {
            console.error("Error toggling news:", err);
        }
    };

    const handleDeleteNews = async (id) => {
        if (!confirm("Delete this news item permanently?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl(`/api/admin/news/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchNews();
        } catch (err) {
            console.error("Error deleting news:", err);
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
                setError(null);
            } else {
                if (res.status === 401) {
                    setError("Session expired. Please log out and back in.");
                    return;
                }
                const text = await res.text().catch(() => '');
                let msg = `Queue Error (${res.status})`;
                try {
                    const data = JSON.parse(text);
                    msg = data.message || msg;
                } catch (e) {
                    msg = text ? `${msg}: ${text.substring(0, 50)}` : msg;
                }
                setError(msg);
            }
        } catch (err) {
            console.error("Error fetching pending:", err);
            setError("Moderation link offline.");
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

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/admin/assets'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setAssets(await res.json());
                setError(null);
            } else {
                if (res.status === 401) {
                    setError("Session expired. Please log out and back in.");
                    return;
                }
                const text = await res.text().catch(() => '');
                let msg = `Evidence Error (${res.status})`;
                try {
                    const data = JSON.parse(text);
                    msg = data.message || msg;
                } catch (e) {
                    msg = text ? `${msg}: ${text.substring(0, 50)}` : msg;
                }
                setError(msg);
            }
        } catch (err) {
            console.error("Error fetching assets:", err);
            setError("Evidence link offline.");
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
                setError(null);
            } else {
                if (res.status === 401) {
                    setError("Session expired. Please log out and back in.");
                    return;
                }
                const text = await res.text().catch(() => '');
                let msg = `API Connection Issue (${res.status})`;
                try {
                    const data = JSON.parse(text);
                    msg = data.message || msg;
                } catch (e) {
                    msg = text ? `${msg}: ${text.substring(0, 50)}` : msg;
                }
                setError(msg);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Platform Link Offline");
        } finally {
            setLoading(false);
        }
    };

    const handleFreeze = (userId) => {
        requireAdminName('Toggle Terminal Lock', async (adminName) => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl(`/api/users/admin/${userId}/freeze`), {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminDisplayName: adminName })
                });
                if (res.ok) {
                    const data = await res.json();
                    setUsers(users.map(u => u._id === userId ? { ...u, isFrozen: data.isFrozen } : u));
                    alert(data.message);
                }
            } catch (err) {
                alert("Error updating user status: " + err.message);
            }
        });
    };

    const handleVerifyUser = (userId) => {
        requireAdminName('Force Identity Verification', async (adminName) => {
            if (!confirm("Manually verify this investigator's identity? This will bypass OTP verification.")) return;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl(`/api/admin/users/${userId}/verify`), {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminDisplayName: adminName })
                });
                if (res.ok) {
                    setUsers(users.map(u => u._id === userId ? { ...u, isVerified: true } : u));
                    alert("Agent identity manually verified.");
                    fetchLogs();
                } else {
                    const data = await res.json();
                    alert("Verification failed: " + data.message);
                }
            } catch (err) {
                alert("Error verifying user: " + err.message);
            }
        });
    };

    const handleBan = () => {
        if (!banModal.reason) return alert("Please provide a reason for the enforcement action.");
        requireAdminName('Ban Agent', async (adminName) => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl(`/api/admin/users/${banModal.userId}/ban`), {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ reason: banModal.reason, adminDisplayName: adminName })
                });
                if (res.ok) {
                    setUsers(users.map(u => u._id === banModal.userId ? { ...u, isBanned: true, banReason: banModal.reason } : u));
                    setBanModal({ isOpen: false, userId: null, username: '', reason: '' });
                    alert("Agent permanently suspended.");
                    fetchLogs();
                }
            } catch (err) {
                alert("Ban Error: " + err.message);
            }
        });
    };

    const handleUnban = (userId) => {
        requireAdminName('Lift Agent Ban', async (adminName) => {
            if (!confirm("Lift the suspension for this agent?")) return;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl(`/api/admin/users/${userId}/unban`), {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminDisplayName: adminName })
                });
                if (res.ok) {
                    setUsers(users.map(u => u._id === userId ? { ...u, isBanned: false } : u));
                    alert("Agent access restored.");
                    fetchLogs();
                }
            } catch (err) {
                alert("Unban Error: " + err.message);
            }
        });
    };

    const handleResetPassword = (userId) => {
        requireAdminName('Reset Password Payload', async (adminName) => {
            if (!confirm("Are you sure you want to reset this user's password? A temporary password will be generated.")) return;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl(`/api/users/admin/${userId}/reset-password`), {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminDisplayName: adminName })
                });
                if (res.ok) {
                    const data = await res.json();
                    alert(`Password Reset Successful!\nTemporary Password: ${data.tempPassword}\n\nPlease provide this to the user.`);
                }
            } catch (err) {
                alert("Error resetting password: " + err.message);
            }
        });
    };

    const handleToggleLeaderboard = (userId) => {
        requireAdminName('Toggle Leaderboard Visibility', async (adminName) => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl(`/api/users/admin/${userId}/leaderboard-toggle`), {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminDisplayName: adminName })
                });
                if (res.ok) {
                    const data = await res.json();
                    setUsers(users.map(u => u._id === userId ? { ...u, showInLeaderboard: data.showInLeaderboard } : u));
                    alert(data.message);
                    fetchLogs();
                } else {
                    const data = await res.json();
                    alert("Operation failed: " + data.message);
                }
            } catch (err) {
                alert("Error toggling leaderboard status: " + err.message);
            }
        });
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

    const handleClearLogs = () => {
        requireAdminName('Erase Action Logs', async (adminName) => {
            if (!confirm("CRITICAL ACTION: Are you sure you want to PERMANENTLY ERASE all audit logs? This cannot be undone.")) return;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl('/api/admin/logs'), {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminDisplayName: adminName })
                });
                if (res.ok) {
                    fetchLogs();
                    alert("Audit logs cleared successfully.");
                }
            } catch (err) {
                alert("Error clearing logs: " + err.message);
            }
        });
    };

    const handleModerate = (id, status) => {
        requireAdminName(status === 'approved' ? 'Approve Scenario' : 'Reject Scenario', async (adminName) => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl(`/api/ugc-scenarios/${id}/moderate`), {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status, adminDisplayName: adminName })
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
        });
    };

    const handleToggleBounty = (id) => {
        requireAdminName('Toggle XP Bounty', async (adminName) => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl(`/api/ugc-scenarios/admin/${id}/bounty`), {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminDisplayName: adminName })
                });
                if (res.ok) {
                    const data = await res.json();
                    setLiveScenarios(liveScenarios.map(s => s._id === id ? { ...s, isBountied: data.isBountied } : s));
                }
            } catch (err) {
                alert("Error toggling bounty: " + err.message);
            }
        });
    };

    const handleCreateEvent = (e) => {
        e.preventDefault();
        requireAdminName('Deploy Operation Event', async (adminName) => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl('/api/admin/events'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ ...newEvent, adminDisplayName: adminName })
                });
                if (res.ok) {
                    alert("Global Operation Deployed!");
                    setNewEvent({ title: '', description: '', type: 'XP_BOOST', multiplier: 2.0, expiresAt: '' });
                    fetchEvents();
                }
            } catch (err) {
                alert("Error creating event: " + err.message);
            }
        });
    };

    const handleCancelEvent = (id) => {
        requireAdminName('Cancel Operation', async (adminName) => {
            if (!confirm("Are you sure you want to cancel this operation?")) return;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl(`/api/admin/events/${id}`), {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminDisplayName: adminName })
                });
                if (res.ok) {
                    fetchEvents();
                    alert("Operation Terminated.");
                }
            } catch (err) {
                alert("Error canceling event: " + err.message);
            }
        });
    };

    const handleToggleFeature = (id) => {
        requireAdminName('Toggle Scenario Pin', async (adminName) => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl(`/api/admin/scenarios/${id}/feature`), {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminDisplayName: adminName })
                });
                if (res.ok) {
                    const data = await res.json();
                    setLiveScenarios(liveScenarios.map(s => s._id === id ? { ...s, isFeatured: data.isFeatured } : s));
                }
            } catch (err) {
                alert("Error pinning scenario: " + err.message);
            }
        });
    };

    const handleToggleMaintenance = () => {
        const action = !isMaintenanceMode ? 'ACTIVATE' : 'DEACTIVATE';
        requireAdminName(`${action} System Lockdown`, async (adminName) => {
            if (!window.confirm(`Are you sure you want to ${action} Global Maintenance Mode? Non-admin users will be blocked.`)) {
                return;
            }
            
            try {
                const token = localStorage.getItem('token');
                
                // Calculate expectedReturn if 'custom' is not selected but duration is
                let returnTime = expectedReturn;
                if (!isMaintenanceMode && maintenanceDuration !== 'custom') {
                    const ms = parseInt(maintenanceDuration) * 60 * 1000;
                    returnTime = new Date(Date.now() + ms).toISOString();
                }

                const res = await fetch(buildApiUrl('/api/admin/settings/maintenance'), {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        isActive: !isMaintenanceMode,
                        expectedReturn: returnTime,
                        adminDisplayName: adminName
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    setIsMaintenanceMode(data.isActive);
                    setExpectedReturn(data.expectedReturn || '');
                    window.alert(`Maintenance mode ${data.isActive ? 'ENABLED' : 'DISABLED'}`);
                    fetchLogs();
                } else {
                    const errData = await res.json().catch(() => ({}));
                    window.alert(`Failed to toggle maintenance: ${errData.message || 'Server error'}`);
                }
            } catch (err) {
                window.alert("Error toggling maintenance: " + err.message);
            }
        });
    };

    const handleAssetTakedown = (assetId, assetType) => {
        requireAdminName('Takedown Asset', async (adminName) => {
            if (!confirm("Are you sure you want to take down this specific image? This will permanently remove it.")) return;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl('/api/admin/assets'), {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ id: assetId, type: assetType, adminDisplayName: adminName })
                });

                if (res.ok) {
                    setAssets(assets.filter(a => !(a._id === assetId && a.type === assetType)));
                    alert("Image successfully removed from platform.");
                } else {
                    const data = await res.json();
                    alert(data.message || "Failed to remove image");
                }
            } catch (err) {
                alert("Error removing asset: " + err.message);
            }
        });
    };

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };

    const downloadCSV = () => {
        if (!analytics) return;
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "INVESTIGATOR GROWTH REPORT\n";
        csvContent += "Date,New Registrations\n";
        analytics.registrations.forEach(r => {
            csvContent += `${r._id},${r.count}\n`;
        });
        csvContent += "\nPLATFORM PERFORMANCE (ACCURACY)\n";
        csvContent += "Category,Avg Accuracy %,Total Attempts\n";
        analytics.categoryStats.forEach(c => {
            csvContent += `${c._id},${Math.round(c.avgAccuracy)}%,${c.totalAttempts}\n`;
        });
        csvContent += "\nGEOGRAPHIC DISTRIBUTION\n";
        csvContent += "Country,Agent Count\n";
        analytics.countries.forEach(c => {
            csvContent += `${c._id || 'Undisclosed'},${c.count}\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `SecuritySim_Intelligence_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadPDF = async () => {
        const element = document.getElementById('analytics-report-area');
        if (!element) return;
        try {
            const canvas = await html2canvas(element, {
                backgroundColor: '#0d1117',
                scale: 2,
                logging: false,
                useCORS: true
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.setDrawColor(0, 240, 255);
            pdf.rect(5, 5, pdfWidth - 10, pdfHeight + 10);
            pdf.setFontSize(18);
            pdf.setTextColor(0, 240, 255);
            pdf.text("HQ TACTICAL INTELLIGENCE REPORT", 10, 20);
            pdf.setFontSize(10);
            pdf.setTextColor(139, 148, 158);
            pdf.text(`Generated: ${new Date().toLocaleString()} | Administrator: ${user.username}`, 10, 28);
            pdf.addImage(imgData, 'PNG', 10, 35, pdfWidth - 20, pdfHeight);
            pdf.save(`SecuritySim_Global_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            console.error("PDF Export Failure:", err);
            alert("Report synthesis failed. Check console for telemetry errors.");
        }
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
                    {activeTab === 'evidence' && 'Evidence Locker'}
                    {activeTab === 'vitals' && 'System Health Control'}
                </h1>
                <p>
                    {activeTab === 'moderation' && `Total pending scenarios: ${stats.pending} | Live: ${liveScenarios.length}`}
                    {activeTab === 'users' && `Total registered investigators: ${stats.totalUsers}`}
                    {activeTab === 'analytics' && 'Real-time platform performance metrics.'}
                    {activeTab === 'operations' && 'Manage global XP boosts and time-limited operations.'}
                    {activeTab === 'evidence' && 'Review uploaded visual assets from users and scenarios.'}
                    {activeTab === 'vitals' && 'Monitor core infrastructure and maintain data integrity.'}
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
                else if (activeTab === 'evidence') fetchAssets();
                else if (activeTab === 'vitals') fetchVitals();
            }}>Refresh</button>
        </header>
    );

    const renderModeration = () => (
        <div className="moderation-container animate-fade-in">
            <div className="moderation-tabs">
                <button className={`mod-tab ${moderationView === 'pending' ? 'active' : ''}`} onClick={() => setModerationView('pending')}>
                    Pending Queue ({stats.pending})
                </button>
                <button className={`mod-tab ${moderationView === 'live' ? 'active' : ''}`} onClick={() => setModerationView('live')}>
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
                                    <button className="btn-view" onClick={() => setActiveScenario(s)}><Eye size={16} /> Review</button>
                                    <button className="btn-approve" onClick={() => handleModerate(s._id, 'approved')}><CheckCircle size={16} /> Approve</button>
                                    <button className="btn-reject" onClick={() => handleModerate(s._id, 'rejected')}><XCircle size={16} /> Reject</button>
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
                                <button className={`btn-bounty ${s.isBountied ? 'active' : ''}`} onClick={() => handleToggleBounty(s._id)}><Zap size={16} /> {s.isBountied ? 'Revoke Bounty' : 'Set 2x XP Bounty'}</button>
                                <button className={`btn-feature ${s.isFeatured ? 'active' : ''}`} onClick={() => handleToggleFeature(s._id)}><Star size={16} /> {s.isFeatured ? 'Unpin Featured' : 'Pin to Featured'}</button>
                                <button className="btn-reject" onClick={() => handleModerate(s._id, 'rejected')}><AlertCircle size={16} /> Takedown</button>
                            </div>
                        </div>
                    ))}
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
                    {Array.isArray(users) && users.length > 0 ? (
                        users.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                            <tr key={u._id}>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar">{u.username ? u.username[0] : '?'}</div>
                                        <div className="user-text">
                                            <span className="username">{u.username || 'Terminated Account'}</span>
                                            <span className="user-id">{u._id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="xp-cell">
                                        Lvl {u.level || 0}
                                        <span className="xp-pills">{u.xp || 0} XP</span>
                                    </div>
                                </td>
                                <td>{u.teamId?.name || <span className="text-muted">No Team</span>}</td>
                                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}</td>
                                <td>
                                    <div className="status-container">
                                        <span className={`status-badge ${u.isBanned ? 'banned' : u.isFrozen ? 'frozen' : 'active'}`}>
                                            {u.isBanned ? 'BANNED' : u.isFrozen ? 'Terminal Locked' : 'Active'}
                                        </span>
                                        {u.showInLeaderboard === false && (
                                            <span className="status-badge" style={{ background: 'rgba(255, 171, 0, 0.1)', color: '#ffab00', border: '1px solid currentColor', marginLeft: '5px' }}>
                                                HIDDEN FROM RANK
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="actions-cell">
                                    {!u.isVerified && (
                                        <button className="action-btn verify" onClick={() => handleVerifyUser(u._id)} title="Force Verify Identity"><Shield size={16} /></button>
                                    )}
                                    <button className={`action-btn ${u.isFrozen ? 'unfreeze' : 'freeze'}`} onClick={() => handleFreeze(u._id)} title={u.isFrozen ? 'Unfreeze' : 'Freeze'}><AlertCircle size={16} /></button>
                                    <button className={`action-btn ${u.showInLeaderboard === false ? 'unhide' : 'hide'}`} onClick={() => handleToggleLeaderboard(u._id)} title={u.showInLeaderboard === false ? 'Show in Leaderboard' : 'Hide from Leaderboard'} style={{ color: u.showInLeaderboard === false ? 'var(--text-secondary)' : 'var(--accent)' }}>
                                        <Award size={16} />
                                    </button>
                                    <button className={`action-btn ${u.isBanned ? 'unban' : 'ban'}`} onClick={() => u.isBanned ? handleUnban(u._id) : setBanModal({ isOpen: true, userId: u._id, username: u.username, reason: '' })} title={u.isBanned ? 'Lift Ban' : 'Ban User'}><XCircle size={16} /></button>
                                    <button className="action-btn reset" onClick={() => handleResetPassword(u._id)} title="Reset Password"><Lock size={16} /></button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '100px 0' }}>
                                <div className="queue-empty">
                                    <Search size={48} className="text-muted" />
                                    <h2>{error || "No Investigators Found"}</h2>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderAnalytics = () => (
        <div className="admin-analytics animate-fade-in">
            <div className="analytics-actions">
                <button className="export-btn csv" onClick={downloadCSV}><Download size={16} /> Export CSV</button>
                <button className="export-btn pdf" onClick={downloadPDF}><FileText size={16} /> Synthesis PDF Report</button>
            </div>
            <div className="analytics-grid" id="analytics-report-area">
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
                                <div className="progress-bg"><div className={`progress-bar ${c.avgAccuracy < 60 ? 'danger' : c.avgAccuracy < 80 ? 'warning' : 'success'}`} style={{ width: `${c.avgAccuracy}%` }}></div></div>
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
                    <h3><Zap size={18} /> Global Event Deployment</h3>
                    <form onSubmit={handleCreateEvent} className="event-form">
                        <div className="form-group">
                            <label>Operation Title</label>
                            <input type="text" placeholder="e.g., XP Overload" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea placeholder="Mission parameters..." value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} required />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Multiplier</label>
                                <input type="number" step="0.1" value={newEvent.multiplier} onChange={e => setNewEvent({ ...newEvent, multiplier: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Expiry</label>
                                <input type="datetime-local" value={newEvent.expiresAt} onChange={e => setNewEvent({ ...newEvent, expiresAt: e.target.value })} required />
                            </div>
                        </div>
                        <button type="submit" className="btn-deploy">Deploy Operation</button>
                    </form>
                    <div className="active-events-list">
                        <h4>Active Operations</h4>
                        {events.filter(e => new Date(e.expiresAt) > new Date()).map(event => (
                            <div key={event._id} className="event-item">
                                <span>{event.title} — {event.multiplier}x</span>
                                <button className="btn-cancel-event" onClick={() => handleCancelEvent(event._id)}>Cancel</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="ops-card">
                    <h3><Radio size={18} /> Tactical Controls</h3>
                    <div className="control-item">
                        <div className="control-text">
                            <strong>Maintenance Mode</strong>
                            <p>Lock platform for all non-admins.</p>
                        </div>
                        <button className={`toggle-btn ${isMaintenanceMode ? 'active' : ''}`} onClick={handleToggleMaintenance}>
                            {isMaintenanceMode ? 'SYSTEM LOCKED' : 'SYSTEM LIVE'}
                        </button>
                    </div>
                    
                    {!isMaintenanceMode && (
                        <div className="maintenance-duration-picker" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#8b949e' }}>Expected Duration</label>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                {['30', '60', '120', 'custom'].map(val => (
                                    <button 
                                        key={val}
                                        type="button"
                                        className={`btn-filter ${maintenanceDuration === val ? 'active' : ''}`}
                                        onClick={() => setMaintenanceDuration(val)}
                                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                                    >
                                        {val === 'custom' ? 'Custom' : `${val}m`}
                                    </button>
                                ))}
                            </div>
                            {maintenanceDuration === 'custom' && (
                                <input 
                                    type="datetime-local" 
                                    value={expectedReturn} 
                                    onChange={e => setExpectedReturn(e.target.value)} 
                                    style={{ width: '100%', padding: '0.5rem', background: '#0d1117', border: '1px solid #30363d', color: 'white', borderRadius: '4px' }}
                                />
                            )}
                        </div>
                    )}

                    <div className="feature-grid" style={{ marginTop: '1.5rem' }}>
                        {Object.entries(featureToggles).map(([key, value]) => (
                            <div key={key} className="feature-toggle-item">
                                <span className="feature-label">{key.replace('_', ' ')}</span>
                                <label className="switch">
                                    <input type="checkbox" checked={value} onChange={() => handleToggleFeatureFlag(key)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="ops-card large" style={{ gridColumn: 'span 2' }}>
                    <div className="audit-log-section">
                        <h4>Mission Logs</h4>
                        <div className="mini-log-list">
                            {logs.slice(0, 15).map(log => {
                                // Extract admin name if available (assuming it's prepended to details like "AdminName — Action")
                                let logText = log.details;
                                let adminName = '';
                                if (log.adminName) {
                                    adminName = log.adminName;
                                }
                                
                                return (
                                    <div key={log._id} className="mini-log-entry">
                                        <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                        <span className="log-text">
                                            {adminName && <strong style={{ color: 'var(--accent)', marginRight: '5px' }}>[{adminName}]</strong>}
                                            {logText}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEvidenceLocker = () => (
        <div className="evidence-locker animate-fade-in">
            {assets.length === 0 ? (
                <div className="queue-empty">
                    <CheckCircle size={48} className="text-muted" />
                    <h2>Locker Empty</h2>
                </div>
            ) : (
                <div className="asset-grid">
                    {assets.map(asset => (
                        <div key={`${asset.type}-${asset._id}`} className="asset-card">
                            <div className="asset-image-container">
                                <img src={asset.url} alt="Evidence" className="asset-img" />
                                <div className="asset-overlay"><button className="btn-takedown" onClick={() => handleAssetTakedown(asset._id, asset.type)}><XCircle size={32} /></button></div>
                            </div>
                            <div className="asset-info">
                                <strong>{asset.uploader}</strong>
                                <span className="text-muted text-small">{asset.context}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderVitals = () => (
        <div className="admin-vitals animate-fade-in">
            <div className="vitals-grid">
                <VitalsCard title="Database Core" icon={Database} pulse={true}>
                    <div className="metric-row"><span>Data Size</span><strong>{vitals?.database?.dataSize || '...'}</strong></div>
                    <div className="metric-row"><span>Storage</span><strong>{vitals?.database?.storageSize || '...'}</strong></div>
                    <div className="metric-row"><span>Collections</span><strong>{vitals?.database?.collections || '0'}</strong></div>
                </VitalsCard>
                <VitalsCard title="Connection Cluster" icon={Server}>
                    <div className="metric-row"><span>Active Links</span><strong>{vitals?.server?.connections?.current || '0'}</strong></div>
                    <div className="metric-row"><span>Available</span><strong>{vitals?.server?.connections?.available || '0'}</strong></div>
                </VitalsCard>
                <VitalsCard title="System Performance" icon={Activity}>
                    <div className="metric-row"><span>Uptime</span><strong>{vitals?.server?.uptime || '...'}</strong></div>
                    <div className="metric-row"><span>Memory</span><strong>{vitals?.server?.mem?.resident || '...'}</strong></div>
                </VitalsCard>
                <div className="vitals-card maintenance-card">
                    <div className="vitals-header"><RefreshCw size={18} className={syncing ? 'spin' : ''} /><h3>Data Integrity</h3></div>
                    <p>Rebuild level parity across all agents and teams.</p>
                    <button className={`sync-btn ${syncing ? 'syncing' : ''}`} onClick={handleRecalculateScores} disabled={syncing}>
                        {syncing ? 'Synchronizing...' : 'Global Score Sync'}
                    </button>
                </div>
            </div>
            <div className="audit-section">
                <h4>Infrastructure Audit</h4>
                <div className="vitals-log-list">
                    {logs.slice(0, 10).map(log => (
                        <div key={log._id} className="vitals-log-entry">
                            <span className="log-badge">{log.action}</span>
                            <span className="log-msg">
                                {log.adminName && <strong style={{color: 'var(--accent)', marginRight: '5px'}}>({log.adminName})</strong>}
                                {log.details}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="admin-dashboard-page">
            <aside className="admin-sidebar">
                <div className="sidebar-brand"><Shield size={24} className="text-primary" /><span>HQ ADMIN</span></div>
                <nav className="sidebar-nav">
                    <button className={`nav-item ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}><Clock size={18} /> Moderation Queue</button>
                    <button className={`nav-item ${activeTab === 'evidence' ? 'active' : ''}`} onClick={() => setActiveTab('evidence')}><Eye size={18} /> Evidence Locker</button>
                    <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><Shield size={18} /> User Directory</button>
                    <button className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}><BarChart2 size={18} /> Analytics</button>
                    <button className={`nav-item ${activeTab === 'operations' ? 'active' : ''}`} onClick={() => setActiveTab('operations')}><Zap size={18} /> Global Operations</button>
                    <button className={`nav-item ${activeTab === 'vitals' ? 'active' : ''}`} onClick={() => setActiveTab('vitals')}><Activity size={18} /> System Health</button>
                </nav>
                <div className="sidebar-footer">
                    <div className="user-info"><div className="user-avatar">{user.username[0]}</div><div className="user-details"><span className="username">{user.username}</span><span className="role">Administrator</span></div></div>
                    <button className="logout-btn" onClick={handleLogout}><LogOut size={16} /> Logout</button>
                </div>
            </aside>
            <main className="admin-main">
                {renderHeader()}
                <div className="admin-content">
                    {loading ? <div className="loading-state"><div className="spinner"></div><p>Loading intel...</p></div> : (
                        <>
                            {activeTab === 'moderation' && renderModeration()}
                            {activeTab === 'evidence' && renderEvidenceLocker()}
                            {activeTab === 'users' && renderUsers()}
                            {activeTab === 'analytics' && renderAnalytics()}
                            {activeTab === 'operations' && renderOperations()}
                            {activeTab === 'vitals' && renderVitals()}
                        </>
                    )}
                </div>
            </main>

            {/* Admin Name Prompt Modal */}
            {adminNameModal.isOpen && (
                <div className="review-overlay" onClick={() => setAdminNameModal({ isOpen: false, pendingAction: null, actionLabel: '' })}>
                    <div className="review-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Authentication Required</h2>
                            <button className="close-btn" onClick={() => setAdminNameModal({ isOpen: false, pendingAction: null, actionLabel: '' })}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: '1rem', color: '#8b949e' }}>
                                You are about to execute: <strong style={{ color: 'white' }}>{adminNameModal.actionLabel}</strong>.
                                Provide your name for the official audit log.
                            </p>
                            <input 
                                type="text" 
                                placeholder="Your Name/Callsign..." 
                                style={{ width: '100%', padding: '0.8rem', background: '#0d1117', border: '1px solid #30363d', color: 'white', borderRadius: '4px', fontSize: '1rem' }}
                                value={adminDisplayName || ''}
                                onChange={e => {
                                    setAdminDisplayName(e.target.value);
                                    sessionStorage.setItem('adminDisplayName', e.target.value);
                                }}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && adminDisplayName.trim()) {
                                        const action = adminNameModal.pendingAction;
                                        setAdminNameModal({ isOpen: false, pendingAction: null, actionLabel: '' });
                                        if (action) action(adminDisplayName.trim());
                                    }
                                }}
                            />
                        </div>
                        <div className="modal-footer">
                            <button className="btn-view" onClick={() => setAdminNameModal({ isOpen: false, pendingAction: null, actionLabel: '' })}>Abort</button>
                            <button className="btn-approve" disabled={!adminDisplayName.trim()} onClick={() => {
                                const action = adminNameModal.pendingAction;
                                setAdminNameModal({ isOpen: false, pendingAction: null, actionLabel: '' });
                                if (action) action(adminDisplayName.trim());
                            }}>Authorize</button>
                        </div>
                    </div>
                </div>
            )}

            {activeScenario && (
                <div className="review-overlay" onClick={() => setActiveScenario(null)}>
                    <div className="review-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>Review: {activeScenario.title}</h2><button className="close-btn" onClick={() => setActiveScenario(null)}>&times;</button></div>
                        <div className="modal-body">
                            <div className="author-card"><div className="author-avatar">{activeScenario.authorId?.username?.[0] || '?'}</div><strong>{activeScenario.authorId?.username || 'Unknown'}</strong></div>
                            <div className="review-section">
                                <h3>Incident Overview</h3>
                                <p className="description">{activeScenario.description}</p>
                            </div>
                            <div className="review-section">
                                <h3>Threat Content</h3>
                                <div className="threat-body" style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '4px', borderLeft: '3px solid #00f0ff', marginBottom: '1rem' }}>
                                    {activeScenario.content?.visualData?.body}
                                </div>
                            </div>
                            <div className="review-section">
                                <h3>User Options</h3>
                                <div className="options-review" style={{ display: 'grid', gap: '0.5rem' }}>
                                    {activeScenario.content?.options?.map((opt, i) => (
                                        <div key={i} className={`opt-item ${opt.isCorrect ? 'correct' : 'incorrect'}`} style={{ padding: '0.5rem', background: opt.isCorrect ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 71, 87, 0.1)', borderRadius: '4px', border: `1px solid ${opt.isCorrect ? '#00ff88' : '#ff4757'}` }}>
                                            <strong>{opt.isCorrect ? 'CORRECT: ' : 'TRAP: '}</strong> {opt.text}
                                            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>Feedback: {opt.feedback}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="review-section"><h3>Educational Guidance</h3><p className="explanation">{activeScenario.content?.educationalExplanation}</p></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-reject" onClick={() => handleModerate(activeScenario._id, 'rejected')}>Reject</button>
                            <button className="btn-approve" onClick={() => handleModerate(activeScenario._id, 'approved')}>Approve</button>
                        </div>
                    </div>
                </div>
            )}

            {banModal.isOpen && (
                <div className="review-overlay" onClick={() => setBanModal({ ...banModal, isOpen: false })}>
                    <div className="review-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="modal-header"><h2>Restrict Agent Access</h2><button className="close-btn" onClick={() => setBanModal({ ...banModal, isOpen: false })}>&times;</button></div>
                        <div className="modal-body">
                            <p>Suspending <strong>{banModal.username}</strong> permanently.</p>
                            <textarea placeholder="Reason..." value={banModal.reason} onChange={e => setBanModal({ ...banModal, reason: e.target.value })} style={{ width: '100%', height: '100px', marginTop: '1rem' }} />
                        </div>
                        <div className="modal-footer"><button className="btn-view" onClick={() => setBanModal({ ...banModal, isOpen: false })}>Cancel</button><button className="btn-reject" onClick={handleBan}>Apply Ban</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}

const VitalsCard = ({ title, icon: Icon, children, pulse }) => (
    <div className={`vitals-card ${pulse ? 'pulse' : ''}`}>
        <div className="vitals-header"><Icon size={18} /><h3>{title}</h3></div>
        <div className="vitals-content">{children}</div>
    </div>
);
