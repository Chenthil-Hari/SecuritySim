import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertOctagon, Trash2, UserX, UserMinus, CheckCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import './AdminModeration.css';

export default function AdminModeration() {
    const { token } = useAuth();
    const [view, setView] = useState('reports'); // 'reports' or 'all'
    const [reports, setReports] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (view === 'reports') fetchReports();
        else fetchAllMessages();
    }, [view]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch(buildApiUrl('/api/moderation/reports'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setReports(await res.json());
            } else {
                setError('Failed to fetch reports');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllMessages = async () => {
        setLoading(true);
        try {
            const res = await fetch(buildApiUrl('/api/moderation/all-messages'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setMessages(await res.json());
            } else {
                setError('Failed to fetch messages');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (reportId, action) => {
        if (!window.confirm(`Are you sure you want to execute action: ${action}?`)) return;
        
        try {
            const res = await fetch(buildApiUrl(`/api/moderation/resolve/${reportId}`), {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ action, resolutionNotes: `Action taken: ${action}` })
            });
            if (res.ok) {
                setReports(reports.filter(r => r._id !== reportId));
            } else {
                alert('Failed to resolve report');
            }
        } catch (err) {
            console.error('Resolution error:', err);
        }
    };

     const handleDeleteMessage = async (postId, type = 'post', commentId = null) => {
        if (!window.confirm('Delete this message?')) return;
        
        const endpoint = type === 'post' 
            ? `/api/feed/post/${postId}` 
            : `/api/feed/comment/${commentId}`;

        try {
            const res = await fetch(buildApiUrl(endpoint), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                if (type === 'post') {
                    setMessages(messages.filter(m => m._id !== postId));
                } else {
                     setMessages(messages.map(p => {
                        if (p._id === postId) {
                            return { ...p, comments: p.comments.filter(c => c._id !== commentId) };
                        }
                        return p;
                    }));
                }
            }
        } catch (err) {
            console.error('Delete error', err);
        }
    };

    return (
        <div className="admin-mod-page">
            <div className="mod-header">
                <Shield size={40} className="mod-icon" />
                <h1>Intelligence Moderation Command</h1>
                <p>Review and sanitize platform communications</p>
            </div>

            <div className="mod-tabs">
                <button 
                    className={`mod-tab ${view === 'reports' ? 'active' : ''}`}
                    onClick={() => setView('reports')}
                >
                    <AlertOctagon size={18} /> Active Reports ({view === 'reports' ? reports.length : '?'})
                </button>
                <button 
                    className={`mod-tab ${view === 'all' ? 'active' : ''}`}
                    onClick={() => setView('all')}
                >
                    <MessageSquare size={18} /> Global Intercepts
                </button>
            </div>

            {loading ? (
                <div className="mod-loading"><RefreshCw className="spin" size={32}/> Loading data...</div>
            ) : error ? (
                <div className="mod-error">{error}</div>
            ) : view === 'reports' ? (
                <div className="reports-list">
                    {reports.length === 0 ? (
                        <div className="mod-empty">No active flags. Comm channels are clear.</div>
                    ) : (
                        reports.map(report => (
                            <div key={report._id} className="report-card">
                                <div className="report-info">
                                    <span className="report-badge">{report.itemModel}</span>
                                    <span className="report-reason"><strong>Reason:</strong> {report.reason}</span>
                                    <span className="report-reporter">Reported by: {report.reporterId?.username}</span>
                                </div>
                                <div className="reported-content">
                                    <strong>Content:</strong> "{report.reportedItemId?.content || '[Content Deleted or Unavailable]'}"
                                    <br />
                                    <small>Author: {report.reportedItemId?.userId?.username || 'Unknown'}</small>
                                </div>
                                <div className="report-actions">
                                    <button className="mod-btn dismiss" onClick={() => handleResolve(report._id, 'DISMISS')}>
                                        <CheckCircle size={16}/> Dismiss Report
                                    </button>
                                    <button className="mod-btn del-content" onClick={() => handleResolve(report._id, 'DELETE_CONTENT')}>
                                        <Trash2 size={16}/> Delete Content
                                    </button>
                                    <button className="mod-btn ban-user" onClick={() => handleResolve(report._id, 'BAN_USER')}>
                                        <UserX size={16}/> Ban User
                                    </button>
                                    <button className="mod-btn wipe-user" onClick={() => handleResolve(report._id, 'DELETE_USER')}>
                                        <UserMinus size={16}/> Delete User Data
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="global-msgs-list">
                     {messages.length === 0 ? (
                        <div className="mod-empty">No communications intercepted.</div>
                    ) : (
                        messages.map(post => (
                            <div key={post._id} className="global-post">
                                <div className="gp-header">
                                    <strong>{post.userId?.username}</strong> posted:
                                    <button className="admin-del-btn" onClick={() => handleDeleteMessage(post._id, 'post')}><Trash2 size={14} /></button>
                                </div>
                                <div className="gp-content">{post.content}</div>
                                
                                {post.comments && post.comments.length > 0 && (
                                    <div className="gp-comments">
                                        {post.comments.map(comment => (
                                            <div key={comment._id} className="gp-comment">
                                                <span><strong>{comment.userId?.username}:</strong> {comment.content}</span>
                                                <button className="admin-del-btn" onClick={() => handleDeleteMessage(post._id, 'comment', comment._id)}><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
