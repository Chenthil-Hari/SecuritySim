import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Shield, Loader2, AlertTriangle, UserPlus, Zap, X, Check, RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../utils/api';
import './PvPLobby.css';

export default function PvPLobby() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [friends, setFriends] = useState([]);
    const [onlineFriends, setOnlineFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inviteSent, setInviteSent] = useState(null); // { toId, matchId }
    const [incomingInvite, setIncomingInvite] = useState(null); // { fromId, fromName, matchId }
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const newSocket = io(window.location.origin);
        setSocket(newSocket);

        if (user) {
            newSocket.emit('identify', user.id);
        }

        newSocket.on('incoming_duel_invite', (data) => {
            setIncomingInvite(data);
        });

        newSocket.on('invite_response', (data) => {
            if (data.accepted) {
                navigate(`/duel/${data.matchId}`);
            } else {
                setInviteSent(null);
                alert(data.message || "Invitation declined.");
            }
        });

        fetchFriends();
        const onlineInterval = setInterval(fetchOnlineFriends, 5000);

        return () => {
            newSocket.close();
            clearInterval(onlineInterval);
        };
    }, [navigate, user]);

    const fetchFriends = async () => {
        try {
            setIsRefreshing(true);
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/friends'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setFriends(data);
                await fetchOnlineFriends();
            }
        } catch (err) {
            console.error("Failed to fetch friends:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const fetchOnlineFriends = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/pvp/online-friends'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setOnlineFriends(data);
            }
        } catch (err) {
            console.error("Error fetching online friends:", err);
        }
    };

    const handleChallenge = async (friend) => {
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl(`/api/pvp/invite/${friend._id}`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            
            if (res.ok) {
                setInviteSent({ toId: friend._id, matchId: data.matchId });
                // Notify via socket
                socket.emit('send_duel_invite', {
                    fromId: user.id,
                    fromName: user.username,
                    toId: friend._id,
                    matchId: data.matchId,
                    scenarioId: data.scenarioId
                });
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to send invitation.");
        }
    };

    const handleInviteResponse = async (accepted) => {
        if (!incomingInvite) return;
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl(`/api/pvp/respond/${incomingInvite.matchId}`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ accept: accepted })
            });

            if (res.ok) {
                socket.emit('respond_to_invite', {
                    fromId: user.id,
                    toId: incomingInvite.fromId,
                    matchId: incomingInvite.matchId,
                    accepted: accepted
                });

                if (accepted) {
                    navigate(`/duel/${incomingInvite.matchId}`);
                } else {
                    setIncomingInvite(null);
                }
            }
        } catch (err) {
            console.error("Error responding to invite:", err);
        }
    };

    return (
        <div className="pvp-lobby-container fade-in">
            <div className="lobby-header">
                <Swords size={48} className="duel-icon-main" />
                <h1>Friend Duel</h1>
                <p>Challenge your network contacts to a real-time cyber security simulation.</p>
            </div>

            <div className="lobby-content">
                <div className="friend-list-section">
                    <div className="section-header-flex">
                        <h2><UserPlus size={20} /> Online Friends</h2>
                        <button 
                            className="refresh-lobby-btn" 
                            onClick={fetchFriends}
                            title="Refresh Status"
                            disabled={isRefreshing}
                        >
                            <RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} />
                        </button>
                    </div>
                    {loading ? (
                        <div className="lobby-loading">
                            <Loader2 className="spinning-loader" />
                            <span>Scanning network...</span>
                        </div>
                    ) : friends.length > 0 ? (
                        <div className="friends-grid">
                            {friends.map(friend => {
                                const fId = (friend.id || friend._id)?.toString();
                                const isOnline = onlineFriends.includes(fId);
                                return (
                                    <div key={fId} className={`friend-card ${isOnline ? 'online' : 'offline'}`}>
                                        <div className="friend-info">
                                            <div className="friend-avatar">
                                                {friend.profilePhoto ? <img src={friend.profilePhoto} alt="" /> : <Shield size={24} />}
                                                {isOnline && <div className="online-indicator"></div>}
                                            </div>
                                            <div className="friend-meta">
                                                <span className="friend-name">{friend.username}</span>
                                                <span className={`status-text ${isOnline ? 'text-online' : 'text-offline'}`}>
                                                    {isOnline ? 'AVAILABLE' : 'OFFLINE'}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            className="challenge-btn" 
                                            onClick={() => handleChallenge(friend)}
                                            disabled={inviteSent !== null || !isOnline}
                                        >
                                            Challenge
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="no-friends">
                            <Zap size={32} />
                            <p>No friends found in your network.</p>
                            <button className="add-btn" onClick={() => navigate('/teams')}>Add Friends in Teams</button>
                        </div>
                    )}
                </div>

                {inviteSent && (
                    <div className="invite-sent-overlay">
                        <div className="invite-modal">
                            <Loader2 className="spinning-loader" />
                            <h3>Invitation Sent</h3>
                            <p>Waiting for opponent to accept the simulation request...</p>
                            <button className="cancel-invite-btn" onClick={() => setInviteSent(null)}>Cancel</button>
                        </div>
                    </div>
                )}

                {incomingInvite && (
                    <div className="incoming-invite-overlay">
                        <div className="invite-modal alert">
                            <AlertTriangle size={32} color="#ffbd2e" />
                            <h3>INCOMING CHALLENGE</h3>
                            <p><strong>{incomingInvite.fromName}</strong> has challenged you to a 1v1 Duel!</p>
                            <div className="modal-actions">
                                <button className="accept-btn" onClick={() => handleInviteResponse(true)}>
                                    <Check size={18} /> Accept
                                </button>
                                <button className="decline-btn" onClick={() => handleInviteResponse(false)}>
                                    <X size={18} /> Decline
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="lobby-error">
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
