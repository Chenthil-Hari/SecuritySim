import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
    Send, Users, Shield, MessageSquare, Info, Layout, 
    CheckCircle, Search, Terminal, Cpu, Activity, 
    AlertTriangle, Zap, Database, Globe, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { interactiveScenarios } from '../data/interactiveScenarios';
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
    const [scenario, setScenario] = useState(null);
    const [currentNodeId, setCurrentNodeId] = useState('start');
    const [history, setHistory] = useState([]);
    const [activeTool, setActiveTool] = useState(null);
    const [toolOutput, setToolOutput] = useState([]);
    
    const messagesEndRef = useRef(null);
    const consoleEndRef = useRef(null);

    useEffect(() => {
        const newSocket = io(window.location.origin);
        setSocket(newSocket);

        const fetchState = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/warrooms/${roomId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    const wr = data.warRoom;
                    setWarRoomData(wr);
                    setMessages(data.messages || []);
                    setEvidence(wr?.evidenceBoard || { items: [] });
                    setHistory(wr?.history || []);
                    
                    // Find matching scenario
                    const found = interactiveScenarios.find(s => s.id === wr?.scenarioId) || interactiveScenarios[0];
                    setScenario(found);

                    // Safety: Validate currentNodeId exists in the chosen scenario
                    const storedNode = wr?.currentNodeId || 'start';
                    if (found && found.nodes && found.nodes[storedNode]) {
                        setCurrentNodeId(storedNode);
                    } else {
                        setCurrentNodeId('start');
                    }
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

        newSocket.on('participants_updated', (list) => {
            setParticipants(list);
        });

        newSocket.on('scenario_advanced', (data) => {
            setCurrentNodeId(data.nextNodeId);
            if (data.historyItem) {
                setHistory(prev => [...prev, data.historyItem]);
            }
        });

        return () => newSocket.close();
    }, [roomId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, toolOutput]);

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
        setInput('');
    };

    const advanceScenario = async (option) => {
        if (!scenario || !socket) return;
        
        const historyItem = {
            question: scenario.nodes[currentNodeId].text,
            choice: option.text,
            points: option.points || 0,
            timestamp: new Date()
        };

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/warrooms/${roomId}/advance`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nextNodeId: option.nextNodeId,
                    historyItem
                })
            });

            if (res.ok) {
                socket.emit('identify', user.id);
                socket.emit('advance_scenario', {
                    roomId,
                    nextNodeId: option.nextNodeId,
                    historyItem
                });
                setCurrentNodeId(option.nextNodeId);
                setHistory(prev => [...prev, historyItem]);
            }
        } catch (err) {
            console.error("Failed to advance scenario:", err);
        }
    };

    const runTool = (toolName) => {
        setActiveTool(toolName);
        setToolOutput(prev => [...prev, { type: 'system', text: `Initiating ${toolName}...` }]);
        
        setTimeout(() => {
            let result = "";
            switch(toolName) {
                case 'Scanner':
                    result = "Scan complete. No new active external connections found in this subnet.";
                    break;
                case 'Log Analyzer':
                    result = "Analyzing authentication logs... Found 3 failed login attempts from IP 192.168.1.45 at 02:44 AM.";
                    break;
                case 'Packet Sniffer':
                    result = "Intercepting local traffic... Large outbound HTTPS POST detected to unknown hash-node destination.";
                    break;
                default:
                    result = "Tool execution completed with no significant findings.";
            }
            setToolOutput(prev => [...prev, { type: 'result', text: result }]);
        }, 1500);
    };

    const addEvidence = (label) => {
        if (!socket) return;
        const newItem = {
            id: Date.now().toString(),
            label,
            x: Math.random() * 70 + 15,
            y: Math.random() * 70 + 15,
            revealedBy: user.username
        };
        const updatedEvidence = { items: [...evidence.items, newItem] };
        setEvidence(updatedEvidence);
        
        const token = localStorage.getItem('token');
        fetch(`/api/warrooms/${roomId}/evidence`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ evidence: updatedEvidence })
        });
        
        socket.emit('update_evidence', { roomId, evidence: updatedEvidence });
    };

    if (!warRoomData || !scenario) return <div className="loading-screen">Decrypting War Room Access...</div>;

    const currentNode = scenario.nodes[currentNodeId];
    const isFinished = currentNode?.options?.length === 0;

    return (
        <div className="warroom-layout">
            <header className="warroom-header">
                <div className="header-left">
                    <Shield className="status-glow" />
                    <div>
                        <h1>T.O.C: {warRoomData.name}</h1>
                        <span className="scen-badge">Status: {warRoomData.status.toUpperCase()}</span>
                    </div>
                </div>
                <div className="header-right">
                    <div className="participants-list">
                        <Users size={16} />
                        {warRoomData.activeParticipants?.map(p => (
                            p && <span key={p._id || Math.random()} className="user-tag">{p.username || 'Agent'}</span>
                        ))}
                    </div>
                    <button className="btn-exit" onClick={() => navigate('/teams')}>Exit Session</button>
                </div>
            </header>

            <div className="warroom-main">
                {/* Left Panel: Tools & Log Console */}
                <aside className="warroom-tool-panel">
                    <div className="tool-section">
                        <div className="section-header"><Cpu size={16} /> Security Toolbox</div>
                        <div className="tool-grid">
                            <button onClick={() => runTool('Scanner')}><Search size={14} /> Recon Scan</button>
                            <button onClick={() => runTool('Log Analyzer')}><Database size={14} /> Log Audit</button>
                            <button onClick={() => runTool('Packet Sniffer')}><Globe size={14} /> Sniffer</button>
                            <button onClick={() => runTool('Decrypter')}><Lock size={14} /> Decrypter</button>
                        </div>
                    </div>

                    <div className="console-section">
                        <div className="section-header"><Terminal size={16} /> System Intel Feed</div>
                        <div className="console-body">
                            {history.length === 0 && toolOutput.length === 0 && (
                                <div className="console-placeholder">Awaiting system telemetry...</div>
                            )}
                            {history.map((h, i) => (
                                <div key={`hist-${i}`} className="console-entry">
                                    <span className="timestamp">[{h?.timestamp ? new Date(h.timestamp).toLocaleTimeString() : '??:??'}]</span>
                                    <span className="type alert">INCIDENT_UPDATE:</span>
                                    <p className="msg">{h?.choice || 'N/A'}</p>
                                </div>
                            ))}
                            {toolOutput.map((o, i) => (
                                <div key={`tool-${i}`} className={`console-entry ${o.type}`}>
                                    <span className="type">{o.type?.toUpperCase()}:</span>
                                    <p className="msg">{o.text}</p>
                                </div>
                            ))}
                            <div ref={consoleEndRef} />
                        </div>
                    </div>
                </aside>

                {/* Center: Scenario Narrative & Evidence */}
                <main className="warroom-center">
                    <section className="scenario-stage">
                        <div className="section-header"><Activity size={16} /> Tactical Assessment</div>
                        <div className="narrative-box">
                            <h2>{scenario.title || 'Unknown Incident'}</h2>
                            <p className="narrative-text">{currentNode?.text || 'Analyzing data... State unknown.'}</p>
                            
                            {!isFinished && currentNode?.options ? (
                                <div className="decision-grid">
                                    {currentNode.options.map((opt, i) => (
                                        <button key={i} className="decision-btn" onClick={() => advanceScenario(opt)}>
                                            <span className="btn-count">0{i+1}</span>
                                            {opt.text}
                                        </button>
                                    ))}
                                </div>
                            ) : isFinished && currentNode ? (
                                <div className="scenario-complete animate-pop">
                                    <AlertTriangle className={currentNode.isSuccess ? 'success' : 'fail'} />
                                    <h3>Scenario {currentNode.isSuccess ? 'Resolved' : 'Escalated'}</h3>
                                    <p>{currentNode.explanation}</p>
                                    <button className="btn-primary" onClick={() => navigate('/teams')}>Return to Base</button>
                                </div>
                            ) : (
                                <div className="scenario-error">Awaiting tactical data...</div>
                            )}
                        </div>
                    </section>

                    <section className="evidence-board-mini">
                        <div className="section-header"><Layout size={16} /> Shared Evidence Board</div>
                        <div className="board-canvas-mini">
                            <div className="blueprint-grid"></div>
                            {evidence.items.length === 0 && (
                                <div className="empty-msg">No markers on board</div>
                            )}
                            {evidence.items.map(item => (
                                <div 
                                    key={item.id} 
                                    className="evidence-marker"
                                    style={{ left: `${item.x}%`, top: `${item.y}%` }}
                                >
                                    <Zap size={12} />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="board-quick-actions">
                            <button onClick={() => addEvidence('Target IP Identified')}>Mark IP</button>
                            <button onClick={() => addEvidence('Malicious Hash Found')}>Mark Hash</button>
                            <button onClick={() => addEvidence('Entry Point Located')}>Mark Entry</button>
                        </div>
                    </section>
                </main>

                {/* Right Panel: Chat & Participants */}
                <aside className="warroom-side">
                    <div className="chat-container">
                        <div className="section-header"><MessageSquare size={16} /> Team Comms</div>
                        <div className="chat-log">
                            {messages.map((msg, i) => (
                                <div key={i} className={`chat-line ${user && msg.senderId === user.id ? 'own' : ''}`}>
                                    <span className="sender">{msg.senderName || 'Unknown'}</span>
                                    <p className="text">{msg.text}</p>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form className="chat-input" onSubmit={handleSendMessage}>
                            <input 
                                type="text" 
                                placeholder="Send intel..." 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button type="submit"><Send size={16} /></button>
                        </form>
                    </div>

                    <div className="mission-objectives">
                        <div className="section-header"><Info size={16} /> Mission Parameters</div>
                        <div className="obj-body">
                            <p>{scenario.description}</p>
                            <ul className="obj-list">
                                <li>Isolate Infected Subnets</li>
                                <li>Identify Threat Actor</li>
                                <li>Prevent Data Exfiltration</li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
