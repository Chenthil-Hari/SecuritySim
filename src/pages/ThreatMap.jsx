import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulatedThreats } from '../hooks/useSimulatedThreats';
import { buildApiUrl } from '../utils/api';
import { Globe, ShieldAlert, Activity, ShieldCheck, Server, Radio, ArrowLeft } from 'lucide-react';
import './ThreatMap.css';

export default function ThreatMap() {
    const navigate = useNavigate();
    const [realEvents, setRealEvents] = useState([]);

    // Fetch recent real challenges to mix into the map as "Neutralized Threats"
    useEffect(() => {
        const fetchRecentEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(buildApiUrl('/api/challenges'), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.history) {
                    setRealEvents(data.history.slice(0, 5));
                }
            } catch (err) {
                console.log("Could not fetch real events for map overlay.");
            }
        };
        fetchRecentEvents();
    }, []);

    const { activeThreats, log, hubs, activeNodes } = useSimulatedThreats(realEvents);

    return (
        <div className="threat-map-page">
            <div className="page-top-nav">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>
            </div>
            <header className="map-header">
                <div className="map-title">
                    <Globe size={28} className="text-primary" />
                    <h1>Global Threat Matrix</h1>
                </div>
                <div className="map-stats">
                    <div className="stat-box">
                        <Activity size={16} className="text-danger" />
                        <span>Active Vectors: <strong>{activeThreats.length}</strong></span>
                    </div>
                    <div className="stat-box">
                        <ShieldCheck size={16} className="text-success" />
                        <span>Recent Neutralized: <strong>{realEvents.length}</strong></span>
                    </div>
                </div>
            </header>

            <div className="map-dashboard-grid">
                <div className="map-visual-container">
                    {/* SVG Map Background overlay */}
                    <div className="svg-map-wrapper">
                        <svg viewBox="0 0 1000 500" className="world-map-svg">
                            {/* Stylized background paths representing continents (approximate geometric blobs for effect) */}
                            <path d="M150,150 Q180,100 250,120 T350,150 Q400,200 350,250 T200,300 Q150,250 150,150 Z" className="continent" />
                            <path d="M450,120 Q500,80 600,100 T700,150 Q750,200 650,250 T500,200 Q450,150 450,120 Z" className="continent" />
                            <path d="M250,320 Q300,300 350,350 T320,450 Q280,480 250,400 T250,320 Z" className="continent" />
                            <path d="M550,250 Q600,200 650,280 T600,400 Q550,380 500,300 T550,250 Z" className="continent" />
                            <path d="M750,200 Q800,150 900,180 T950,250 Q850,350 800,300 T750,200 Z" className="continent" />
                            <path d="M850,350 Q900,320 950,380 T900,480 Q850,450 820,400 T850,350 Z" className="continent" />

                            {/* Render Hub Nodes */}
                            {hubs.map(hub => (
                                <g key={hub.id} className={`map-node ${activeNodes.includes(hub.id) ? 'active' : ''}`}>
                                    <circle cx={hub.x} cy={hub.y} r="6" className="node-core" />
                                    <circle cx={hub.x} cy={hub.y} r="15" className="node-pulse" />
                                    <text x={hub.x} y={hub.y + 25} className="node-label" textAnchor="middle">{hub.name}</text>
                                </g>
                            ))}

                            {/* Render Active Threat Lines */}
                            {activeThreats.map((threat, idx) => (
                                <g key={`${threat.id}-line`}>
                                    <line
                                        x1={threat.source.x} y1={threat.source.y}
                                        x2={threat.target.x} y2={threat.target.y}
                                        className="threat-line-base"
                                    />
                                    <line
                                        x1={threat.source.x} y1={threat.source.y}
                                        x2={threat.target.x} y2={threat.target.y}
                                        className="threat-line-anim"
                                        stroke={threat.color}
                                    />
                                    <circle cx={threat.target.x} cy={threat.target.y} r="25" className="impact-ripple" stroke={threat.color} />
                                </g>
                            ))}
                        </svg>

                        <div className="map-scanline"></div>
                    </div>
                </div>

                <div className="map-feed-container">
                    <h3><Radio size={18} className="text-warning" /> Live Threat Feed</h3>
                    <div className="feed-list">
                        {log.map(entry => (
                            <div key={entry.id} className={`feed-item ${entry.isReal ? 'real-event' : ''}`}>
                                <div className="feed-timestamp">
                                    {entry.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>
                                <div className="feed-details">
                                    <span className="feed-type" style={{ color: entry.color }}>
                                        {entry.isReal ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                        {entry.type}
                                    </span>
                                    {entry.isReal ? (
                                        <div className="feed-desc">Agent <strong>{entry.agent}</strong> secured {entry.target.name}</div>
                                    ) : (
                                        <div className="feed-desc">Orig: {entry.source.name} ➔ Tgt: {entry.target.name}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
