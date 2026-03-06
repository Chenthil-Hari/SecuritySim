import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Shield, Search, Loader2, XCircle, AlertTriangle } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../utils/api';
import './PvPLobby.css';

export default function PvPLobby() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSearching, setIsSearching] = useState(false);
    const [socket, setSocket] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const newSocket = io(window.location.origin);
        setSocket(newSocket);

        newSocket.on('match_found', (data) => {
            setIsSearching(false);
            navigate(`/duel/${data.matchId}`);
        });

        return () => newSocket.close();
    }, [navigate]);

    const handleStartSearch = async () => {
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/pvp/queue'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            
            if (res.ok) {
                setIsSearching(true);
                if (data.match.status === 'playing') {
                    // Already matched (we were the second player)
                    navigate(`/duel/${data.match._id}`);
                }
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to connect to matchmaking server.");
        }
    };

    const handleCancelSearch = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(buildApiUrl('/api/pvp/leave-queue'), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setIsSearching(false);
        } catch (err) {
            console.error("Error leaving queue:", err);
        }
    };

    return (
        <div className="pvp-lobby-container fade-in">
            <div className="lobby-header">
                <Swords size={48} className="duel-icon-main" />
                <h1>1v1 Cyber Duel</h1>
                <p>Pit your incident response skills against another agent in real-time. First to solve the case with the highest accuracy wins.</p>
            </div>

            <div className="lobby-content">
                {!isSearching ? (
                    <div className="lobby-start-card">
                        <div className="duel-stats">
                            <div className="stat-box">
                                <Shield size={20} />
                                <span>Global Rank: {user?.rank || 'Agent'}</span>
                            </div>
                            <div className="stat-box">
                                <Swords size={20} />
                                <span>PvP Wins: {user?.pvpWins || 0}</span>
                            </div>
                        </div>
                        
                        <button className="search-match-btn" onClick={handleStartSearch}>
                            Find Opponent
                        </button>
                    </div>
                ) : (
                    <div className="searching-card">
                        <Loader2 className="spinning-loader" size={64} />
                        <h2>Interpreting Network Traffic...</h2>
                        <p>Scanning for nearby agents available for a simulation duel.</p>
                        <button className="cancel-search-btn" onClick={handleCancelSearch}>
                            Cancel Search
                        </button>
                    </div>
                )}

                {error && (
                    <div className="lobby-error">
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            <div className="pvp-rules-section">
                <h3><AlertTriangle size={18} /> Duel Protocol</h3>
                <ul>
                    <li>Both agents receive the exact same incident scenario.</li>
                    <li>Points are awarded for speed and correct technical decisions.</li>
                    <li>Bonus XP is awarded to the victor.</li>
                    <li>Disconnecting counts as a tactical retreat (Forfeit).</li>
                </ul>
            </div>
        </div>
    );
}
