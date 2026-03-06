import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Send, Users, Shield, MessageSquare, Info, Layout, CheckCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './WarRoom.css';

export default function WarRoom() {
    const { id: roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [participants, setParticipants] = useState([]);
    const [evidence, setEvidence] = useState({ items: [] });
    const [warRoomData, setWarRoomData] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const newSocket = io(window.location.origin);
        setSocket(newSocket);

        // Fetch initial state
        const fetchState = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/warrooms/${roomId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setWarRoomData(data.warRoom);
                    setMessages(data.messages || []);
                    setEvidence(data.warRoom.evidenceBoard || { items: [] });
                }
            } catch (err) {
                console.error("Error fetching war room state:", err);
            }
        };

        fetchState();

        newSocket.emit('join_warroom', roomId);

        newSocket.on('receive_message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        newSocket.on('evidence_updated', (newEvidence) => {
            setEvidence(newEvidence);
        });

        return () => newSocket.close();
    }, [roomId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket) return;

        const msgData = {
            roomId,
            senderId: user._id,
            senderName: user.username,
            text: input.trim(),
            timestamp: new Date()
        };

        socket.emit('send_message', msgData);
        // We don't optimistically update here for consistency
        setInput('');
    };

    const addEvidence = (item) => {
        const newItem = {
            id: Date.now().toString(),
            label: item,
            x: Math.random() * 80 + 10, // simplified placement
            y: Math.random() * 80 + 10,
            revealedBy: user.username
        };
        const updatedEvidence = { items: [...evidence.items, newItem] };
        setEvidence(updatedEvidence);
        socket.emit('update_evidence', { roomId, evidence: updatedEvidence });
    };

    if (!warRoomData) return <div className="loading-screen">Decrypting War Room Access...</div>;

    return (
        <div className="warroom-layout">
            {/* Header */}
            <header className="warroom-header">
                <div className="header-left">
                    <Shield className="status-glow" />
                    <div>
                        <h1>T.O.C: {warRoomData.name}</h1>
                        <span className="scen-badge">Scenario: {warRoomData.scenarioId}</span>
                    </div>
                </div>
                <div className="header-right">
                    <div className="participants-list">
                        <Users size={16} />
                        {warRoomData.activeParticipants.map(p => (
                            <span key={p._id} className="user-tag">{p.username}</span>
                        ))}
                    </div>
                    <button className="btn-exit" onClick={() => navigate('/teams')}>Exit Session</button>
                </div>
            </header>

            <div className="warroom-main">
                {/* Evidence Board */}
                <section className="evidence-section">
                    <div className="section-header">
                        <Layout size={18} /> Shared Evidence Board
                    </div>
                    <div className="board-canvas">
                        {evidence.items.length === 0 && (
                            <div className="empty-board">
                                <Search size={48} opacity={0.2} />
                                <p>No evidence identified yet. Analyze the simulation files!</p>
                            </div>
                        )}
                        {evidence.items.map(item => (
                            <div 
                                key={item.id} 
                                className="evidence-card animate-pop"
                                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                            >
                                <CheckCircle size={14} className="icon" />
                                <span>{item.label}</span>
                                <small>By {item.revealedBy}</small>
                            </div>
                        ))}
                    </div>
                    <div className="board-controls">
                        <button onClick={() => addEvidence('Suspicious Login') }>Add Suspicious Login</button>
                        <button onClick={() => addEvidence('Spoofed Domain') }>Add Spoofed Domain</button>
                        <button onClick={() => addEvidence('Malicious Executable') }>Add Malicious Executable</button>
                    </div>
                </section>

                {/* Side Panel: Chat & Info */}
                <aside className="warroom-side">
                    <div className="chat-container">
                        <div className="section-header">
                            <MessageSquare size={18} /> Team Intel
                        </div>
                        <div className="chat-log">
                            {messages.map((msg, i) => (
                                <div key={i} className={`chat-line ${msg.senderId === user._id ? 'own' : ''}`}>
                                    <span className="sender">{msg.senderName}</span>
                                    <p className="text">{msg.text}</p>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form className="chat-input" onSubmit={handleSendMessage}>
                            <input 
                                type="text" 
                                placeholder="Report finding..." 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button type="submit"><Send size={18} /></button>
                        </form>
                    </div>

                    <div className="mission-info">
                        <div className="section-header">
                            <Info size={18} /> Objective
                        </div>
                        <div className="info-body">
                            <p>Collaborate with your team to identify the threat markers. Move evidence items to the shared board to build a timeline of the attack.</p>
                            <ul className="objective-list">
                                <li>Identify entry vector</li>
                                <li>Locate malicious persistence</li>
                                <li>Formulate containment strategy</li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
