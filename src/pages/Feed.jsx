import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, MessageCircle, Heart, Flag, Send, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import './Feed.css';

export default function Feed() {
    const { user, token } = useAuth();
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Reporting state
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportData, setReportData] = useState({ itemId: null, itemType: '', reason: '' });
    const [reportStatus, setReportStatus] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch(buildApiUrl('/api/feed'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setPosts(data.posts);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to load feed');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        try {
            const res = await fetch(buildApiUrl('/api/feed/post'), {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: newPostContent })
            });
            const data = await res.json();
            if (res.ok) {
                setPosts([data, ...posts]);
                setNewPostContent('');
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('Failed to create post');
        }
    };

    const handleToggleLike = async (postId) => {
        try {
            const res = await fetch(buildApiUrl(`/api/feed/post/${postId}/like`), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setPosts(posts.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
            }
        } catch (err) {
            console.error('Failed to toggle like', err);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            const res = await fetch(buildApiUrl(`/api/feed/post/${postId}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setPosts(posts.filter(p => p._id !== postId));
            }
        } catch (err) {
            console.error('Failed to delete post', err);
        }
    };

    const handleAddComment = async (postId, content) => {
        if (!content.trim()) return;
        try {
            const res = await fetch(buildApiUrl(`/api/feed/post/${postId}/comment`), {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            const data = await res.json();
            if (res.ok) {
                setPosts(posts.map(p => {
                    if (p._id === postId) {
                        return { ...p, comments: [...(p.comments || []), data] };
                    }
                    return p;
                }));
            }
        } catch (err) {
            console.error('Failed to add comment', err);
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!window.confirm('Delete comment?')) return;
        try {
            const res = await fetch(buildApiUrl(`/api/feed/comment/${commentId}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setPosts(posts.map(p => {
                    if (p._id === postId) {
                        return { ...p, comments: p.comments.filter(c => c._id !== commentId) };
                    }
                    return p;
                }));
            }
        } catch (err) {
            console.error('Failed to delete comment', err);
        }
    };

    const openReportModal = (itemId, itemType) => {
        setReportData({ itemId, itemType, reason: '' });
        setReportStatus('');
        setReportModalOpen(true);
    };

    const submitReport = async (e) => {
        e.preventDefault();
        setReportStatus('submitting');
        try {
            const res = await fetch(buildApiUrl('/api/moderation/report'), {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    reportedItemId: reportData.itemId,
                    itemModel: reportData.itemType,
                    reason: reportData.reason
                })
            });
            if (res.ok) {
                setReportStatus('success');
                setTimeout(() => setReportModalOpen(false), 2000);
            } else {
                setReportStatus('error');
            }
        } catch (err) {
            setReportStatus('error');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="feed-page">
            <div className="feed-header">
                <Shield className="feed-icon" size={32} />
                <h1>Intelligence Feed</h1>
                <p>Global agent dispatches and achievement broadcast</p>
            </div>

            <div className="feed-container">
                <div className="create-post-card">
                    <form onSubmit={handleCreatePost}>
                        <textarea 
                            placeholder="Share an achievement or intelligence briefing..."
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            maxLength={500}
                        />
                        <div className="create-post-footer">
                            <span className="char-count">{newPostContent.length}/500</span>
                            <button type="submit" disabled={!newPostContent.trim()} className="post-btn">
                                <Send size={16} /> Broadcast
                            </button>
                        </div>
                    </form>
                </div>

                {loading ? (
                    <div className="feed-loading">Intercepting transmissions...</div>
                ) : error ? (
                    <div className="feed-error">{error}</div>
                ) : posts.length === 0 ? (
                    <div className="feed-empty">No dispatches found. Be the first to broadcast.</div>
                ) : (
                    <div className="posts-list">
                        {posts.map(post => (
                            <PostCard 
                                key={post._id} 
                                post={post} 
                                user={user}
                                onLike={() => handleToggleLike(post._id)}
                                onDelete={() => handleDeletePost(post._id)}
                                onComment={(content) => handleAddComment(post._id, content)}
                                onDeleteComment={(commentId) => handleDeleteComment(post._id, commentId)}
                                onReport={(itemId, type) => openReportModal(itemId, type)}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                )}
            </div>

            {reportModalOpen && (
                <div className="modal-overlay">
                    <div className="report-modal">
                        <div className="modal-header">
                            <h3><Flag size={20} /> Report {reportData.itemType}</h3>
                            <button className="close-btn" onClick={() => setReportModalOpen(false)}><XCircle size={20}/></button>
                        </div>
                        {reportStatus === 'success' ? (
                            <div className="report-success">
                                <CheckCircle size={40} />
                                <p>Report submitted to Command Center.</p>
                            </div>
                        ) : (
                            <form onSubmit={submitReport}>
                                <p>Why are you reporting this {reportData.itemType.toLowerCase()}?</p>
                                <textarea
                                    value={reportData.reason}
                                    onChange={(e) => setReportData({...reportData, reason: e.target.value})}
                                    placeholder="Provide details for Admin review..."
                                    required
                                    minLength={10}
                                    maxLength={200}
                                />
                                <div className="modal-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setReportModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="submit-report-btn" disabled={reportStatus === 'submitting' || reportData.reason.length < 10}>
                                        {reportStatus === 'submitting' ? 'Submitting...' : 'Submit Report'}
                                    </button>
                                </div>
                                {reportStatus === 'error' && <p className="error-msg">Failed to submit report. Try again.</p>}
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function PostCard({ post, user, onLike, onDelete, onComment, onDeleteComment, onReport, formatDate }) {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    
    // Ensure likes array exists before checking
    const likes = post.likes || [];
    const isLiked = user && likes.includes(user.id);
    const isAuthor = user && post.userId && post.userId._id === user.id;

    const submitComment = (e) => {
        e.preventDefault();
        onComment(commentText);
        setCommentText('');
    };

    return (
        <div className="post-card">
            <div className="post-header">
                <div className="post-author">
                    <div className="author-avatar">{post.userId?.username?.charAt(0) || 'A'}</div>
                    <div>
                        <span className="author-name">{post.userId?.username || 'Unknown Agent'}</span>
                        <div className="post-meta">
                            <Clock size={12} /> {formatDate(post.createdAt)}
                        </div>
                    </div>
                </div>
                <div className="post-actions-menu">
                    {isAuthor ? (
                        <button onClick={onDelete} className="action-btn delete" title="Delete Post"><Trash2 size={16}/></button>
                    ) : (
                        <button onClick={() => onReport(post._id, 'Post')} className="action-btn report" title="Report Post"><Flag size={16}/></button>
                    )}
                </div>
            </div>
            
            <div className="post-content">
                {post.content}
            </div>
            
            <div className="post-stats">
                <button className={`stat-btn ${isLiked ? 'liked' : ''}`} onClick={onLike}>
                    <Heart size={18} fill={isLiked ? "currentColor" : "none"} /> 
                    <span>{likes.length}</span>
                </button>
                <button className="stat-btn" onClick={() => setShowComments(!showComments)}>
                    <MessageCircle size={18} />
                    <span>{post.comments?.length || 0}</span>
                </button>
            </div>

            {showComments && (
                <div className="comments-section">
                    <form className="add-comment" onSubmit={submitComment}>
                        <input 
                            type="text" 
                            placeholder="Add a transmission..." 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button type="submit" disabled={!commentText.trim()}><Send size={16}/></button>
                    </form>

                    <div className="comments-list">
                        {post.comments?.map(comment => {
                            const isCommentAuthor = user && comment.userId && comment.userId._id === user.id;
                            
                            return (
                                <div key={comment._id} className="comment">
                                    <div className="comment-content">
                                        <span className="comment-author">{comment.userId?.username || 'Agent'}:</span>
                                        <span className="comment-text">{comment.content}</span>
                                    </div>
                                    <div className="comment-actions">
                                        {isCommentAuthor ? (
                                            <button onClick={() => onDeleteComment(comment._id)} className="comment-del-btn"><XCircle size={14}/></button>
                                        ) : (
                                            <button onClick={() => onReport(comment._id, 'Comment')} className="comment-rep-btn"><Flag size={14}/></button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
