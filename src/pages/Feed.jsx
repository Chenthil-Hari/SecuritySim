import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, MessageCircle, ThumbsUp, Heart, Flag, Send, Trash2, Clock, CheckCircle, XCircle, Globe, Share2, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import { useRef } from 'react';
import { buildApiUrl } from '../utils/api';
import './Feed.css';

export default function Feed() {
    const { user, token } = useAuth();
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [mediaPreview, setMediaPreview] = useState(null); // base64 string
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    
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
        if (!newPostContent.trim() && !mediaPreview) return;

        try {
            const res = await fetch(buildApiUrl('/api/feed/post'), {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: newPostContent || ' ', media: mediaPreview })
            });
            const data = await res.json();
            if (res.ok) {
                setPosts([data, ...posts]);
                setNewPostContent('');
                setMediaPreview(null);
            } else {
                alert(data.error || 'Failed to broadcast. The payload might be too large or there is a server error.');
            }
        } catch (err) {
            alert('Failed to create post');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('File size must be less than 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setMediaPreview(reader.result);
        };
        reader.readAsDataURL(file);
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
            <div className="feed-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <Globe size={24} style={{ color: 'var(--primary)', marginRight: '10px' }} />
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Intelligence Feed</h2>
            </div>

            <div className="feed-container">
                <div className="create-post-card">
                    <form onSubmit={handleCreatePost}>
                        <div className="create-post-input-wrapper">
                            <div className="author-avatar-small">{user?.username?.charAt(0) || 'A'}</div>
                            <textarea 
                                placeholder="Start a post or share an achievement..."
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                            />
                        </div>
                        {mediaPreview && (
                            <div className="media-preview-container">
                                <button type="button" className="remove-media-btn" onClick={() => setMediaPreview(null)}>
                                    <XCircle size={16} />
                                </button>
                                <img src={mediaPreview} alt="Preview" className="media-preview-img" />
                            </div>
                        )}
                        <div className="create-post-actions-row">
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={handleImageChange}
                            />
                            <button type="button" className="upload-media-btn" onClick={() => fileInputRef.current?.click()}>
                                <ImageIcon size={20} /> Media/Certificate
                            </button>
                            <button type="submit" disabled={!newPostContent.trim() && !mediaPreview} className="post-btn">
                                Broadcast
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
                    <div className="author-info-block">
                        <span className="author-name">{post.userId?.username || 'Unknown Agent'}</span>
                        <span className="author-title">Cyber Security Agent</span>
                        <div className="post-meta">
                            {formatDate(post.createdAt)} • <Globe size={10} style={{ marginLeft: '4px' }}/>
                        </div>
                    </div>
                </div>
                <div className="post-actions-menu">
                    {isAuthor ? (
                        <button onClick={onDelete} className="action-btn delete" title="Delete Post"><Trash2 size={18}/></button>
                    ) : (
                        <button className="action-btn more-options" title="More"><MoreHorizontal size={18}/></button>
                    )}
                </div>
            </div>
            
            <div className="post-content">
                {post.content.trim() !== '' && post.content.trim() !== ' ' && (
                    <div style={{ marginBottom: post.media ? '12px' : '0' }}>{post.content}</div>
                )}
            </div>

            {post.media && (
                <div className="post-media-container">
                    <img src={post.media} alt="Post attachment" className="post-media" />
                </div>
            )}
            
            <div className="post-stats-summary">
                <div className="stats-left">
                    {likes.length > 0 && (
                        <span className="likes-summary"><ThumbsUp size={12} fill="var(--primary)" color="var(--primary)" /> {likes.length}</span>
                    )}
                </div>
                <div className="stats-right">
                    {post.comments?.length > 0 && (
                        <span>{post.comments.length} comments</span>
                    )}
                </div>
            </div>

            <div className="post-actions-row">
                <button className={`linkedin-action-btn ${isLiked ? 'liked' : ''}`} onClick={onLike}>
                    <ThumbsUp size={20} fill={isLiked ? "currentColor" : "none"} /> 
                    <span>Like</span>
                </button>
                <button className="linkedin-action-btn" onClick={() => setShowComments(!showComments)}>
                    <MessageCircle size={20} />
                    <span>Comment</span>
                </button>
                <button className="linkedin-action-btn" onClick={() => onReport(post._id, 'Post')}>
                    <Flag size={20} />
                    <span>Report</span>
                </button>
                <button className="linkedin-action-btn share-btn">
                    <Share2 size={20} />
                    <span>Share</span>
                </button>
            </div>

            {showComments && (
                <div className="comments-section">
                    <form className="add-comment" onSubmit={submitComment}>
                        <div className="author-avatar-small outline">{user?.username?.charAt(0) || 'A'}</div>
                        <input 
                            type="text" 
                            placeholder="Add a comment..." 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        {commentText.trim() && <button type="submit" className="linkedin-post-comment-btn">Post</button>}
                    </form>

                    <div className="comments-list">
                        {post.comments?.map(comment => {
                            const isCommentAuthor = user && comment.userId && comment.userId._id === user.id;
                            
                            return (
                                <div key={comment._id} className="comment-wrapper">
                                    <div className="author-avatar-small">{comment.userId?.username?.charAt(0) || 'A'}</div>
                                    <div className="comment-box">
                                        <div className="comment-header-row">
                                            <span className="comment-author">{comment.userId?.username || 'Agent'}</span>
                                            <div className="comment-actions">
                                                {isCommentAuthor ? (
                                                    <button onClick={() => onDeleteComment(comment._id)} className="comment-del-btn"><Trash2 size={12}/></button>
                                                ) : (
                                                    <button onClick={() => onReport(comment._id, 'Comment')} className="comment-rep-btn" title="Report Comment"><Flag size={12}/></button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="comment-title-sub">Cyber Security Agent</div>
                                        <span className="comment-text">{comment.content}</span>
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
