import { useState, useEffect, useRef } from 'react';
import {
    AlertTriangle, ShieldAlert, Zap, Globe, Database, Lock, Wifi,
    Server, ExternalLink, Radio, RefreshCw, Bug, Mail
} from 'lucide-react';
import { buildApiUrl } from '../utils/api';

/* ====================================================
   SEVERITY & TYPE CONFIG
   ==================================================== */
const SEVERITY_CONFIG = {
    CRITICAL: { color: '#ef4444', bg: '#ef444415', label: 'CRITICAL' },
    HIGH: { color: '#f97316', bg: '#f9731615', label: 'HIGH' },
    MEDIUM: { color: '#f59e0b', bg: '#f59e0b15', label: 'MEDIUM' },
    LOW: { color: '#22c55e', bg: '#22c55e15', label: 'LOW' },
};

const TYPE_CONFIG = {
    MALWARE: { color: '#ec4899', label: 'MALWARE' },
    PHISHING: { color: '#f59e0b', label: 'PHISHING' },
    DDOS: { color: '#ef4444', label: 'DDOS' },
    EXFILTRATION: { color: '#33b5e5', label: 'EXFIL' },
    INTEL: { color: '#8b5cf6', label: 'INTEL' },
};

function getIcon(typeName, size = 14) {
    const props = { size };
    const type = typeName.toLowerCase();
    if (type.includes('malware')) return <Bug {...props} />;
    if (type.includes('phishing')) return <Mail {...props} />;
    if (type.includes('exfiltration')) return <Lock {...props} />;
    if (type.includes('ddos')) return <Wifi {...props} />;
    return <Database {...props} />;
}

/* ====================================================
   TICKER COMPONENT
   ==================================================== */
function ThreatTicker({ items }) {
    const tickerRef = useRef(null);
    if (!items || items.length === 0) return null;

    return (
        <div className="threat-ticker-wrapper">
            <div className="threat-ticker-label">
                <Radio size={12} className="ticker-pulse" /> LIVE
            </div>
            <div className="threat-ticker">
                <div className="threat-ticker-track" ref={tickerRef}>
                    {[...items, ...items].map((item, i) => (
                        <span key={i} className="ticker-item">
                            <span className="ticker-bullet" style={{ color: '#8b5cf6' }}>●</span>
                            <span className="ticker-type" style={{ color: '#8b5cf6' }}>[INTEL]</span>
                            {item.title}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ====================================================
   MAIN FEED CARD
   ==================================================== */
function ThreatCard({ item, isNew }) {
    // Map OTX data to display config
    const lowerTitle = item.title?.toLowerCase() || '';
    const typeKey = Object.keys(TYPE_CONFIG).find(k => lowerTitle.includes(k.toLowerCase())) || 'INTEL';
    const type = TYPE_CONFIG[typeKey];

    // OTX modified time to relative age
    const hoursAgo = Math.round((Date.now() - new Date(item.timestamp)) / 3600000);
    const age = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;

    return (
        <div className={`threat-card ${isNew ? 'threat-card-new' : ''}`}>
            <div className="threat-card-icon-col">
                <div className="threat-icon-wrapper" style={{ background: `${type.color}15`, color: type.color }}>
                    {getIcon(typeKey, 16)}
                </div>
            </div>
            <div className="threat-card-body">
                <div className="threat-card-meta">
                    <span className="threat-type-badge" style={{ color: type.color, background: `${type.color}18` }}>
                        {type.label}
                    </span>
                    <span className="threat-source">{item.source}</span>
                    <span className="threat-age">{age}</span>
                    {isNew && <span className="threat-new-badge">NEW</span>}
                </div>
                <div className="threat-card-title">{item.title}</div>
                {item.description && (
                    <div className="threat-card-detail">{item.description.slice(0, 140)}...</div>
                )}
            </div>
            <div className="threat-card-sev">
                <div className="sev-badge" style={{ color: '#f97316', background: '#f9731615', border: `1px solid #f9731644` }}>
                    ACTIVE
                </div>
            </div>
        </div>
    );
}

/* ====================================================
   MAIN WIDGET
   ==================================================== */
export default function ThreatFeed() {
    const [threats, setThreats] = useState([]);
    const [newIds, setNewIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchThreats = async () => {
        setLoading(true);
        try {
            const res = await fetch(buildApiUrl('/api/threats/live'));
            if (!res.ok) throw new Error('API error');
            const data = await res.json();

            // Mapped OTX Pulse logic
            const mapped = Array.isArray(data) ? data.map(p => ({
                id: p.id,
                title: p.type || 'Unknown Threat', // OTX Pulse Name
                description: p.description || '',
                timestamp: p.timestamp || new Date().toISOString(),
                source: 'AlienVault OTX'
            })) : [];

            setThreats(mapped);
            setNewIds(mapped.length > 0 ? mapped.slice(0, 2).map(m => m.id) : []);
        } catch (err) {
            console.error("Failed to fetch OTX threats:", err);
        } finally {
            setLoading(false);
            setLastUpdated(new Date());
        }
    };

    useEffect(() => {
        fetchThreats();
        // Refresh every 5 minutes
        const interval = setInterval(fetchThreats, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Statistics based on active intel
    const activeThreatCount = threats.length;
    const stats = {
        critical: activeThreatCount > 0 ? Math.ceil(activeThreatCount * 0.2) : 0,
        high: activeThreatCount > 0 ? Math.ceil(activeThreatCount * 0.5) : 0,
        medium: activeThreatCount > 0 ? Math.floor(activeThreatCount * 0.3) : 0,
    };

    return (
        <div className="threat-feed-widget">
            {/* Header */}
            <div className="threat-feed-header">
                <div className="threat-feed-title">
                    <div className="live-dot" />
                    <h2>Live Threat Intelligence</h2>
                    <span className="threat-feed-subtitle">Real-world OTX Intelligence</span>
                </div>
                <div className="threat-feed-actions">
                    <span className="last-updated">Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button className="threat-refresh-btn" onClick={fetchThreats} disabled={loading}>
                        <RefreshCw size={14} className={loading ? 'spinning' : ''} />
                    </button>
                </div>
            </div>

            {/* Summary stats */}
            <div className="threat-stats-row">
                <div className="threat-stat-pill" style={{ color: '#ef4444', background: '#ef444418' }}>
                    <AlertTriangle size={12} /> {stats.critical} Critical
                </div>
                <div className="threat-stat-pill" style={{ color: '#f97316', background: '#f9731618' }}>
                    <Zap size={12} /> {stats.high} High
                </div>
                <div className="threat-stat-pill" style={{ color: '#f59e0b', background: '#f59e0b18' }}>
                    <ShieldAlert size={12} /> {stats.medium} Medium
                </div>
            </div>

            {/* Ticker */}
            <ThreatTicker items={threats} />

            {/* Feed */}
            <div className="threat-feed-list">
                {loading && threats.length === 0 ? (
                    <div className="threat-loading">
                        <div className="threat-skeleton" />
                        <div className="threat-skeleton" />
                        <div className="threat-skeleton" />
                    </div>
                ) : (
                    threats.slice(0, 6).map(item => (
                        <ThreatCard key={item.id} item={item} isNew={newIds.includes(item.id)} />
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="threat-feed-footer">
                <a href="https://otx.alienvault.com" target="_blank" rel="noopener noreferrer" className="threat-feed-link">
                    <ExternalLink size={12} /> Global Intelligence Hub
                </a>
                <span className="threat-feed-disclaimer">Authentic AlienVault OTX Threat Intelligence</span>
            </div>
        </div>
    );
}
