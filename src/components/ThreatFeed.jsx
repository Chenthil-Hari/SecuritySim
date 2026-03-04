import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, ShieldAlert, Zap, Globe, Database, Lock, Wifi, Server, ExternalLink, Radio, RefreshCw } from 'lucide-react';
import './ThreatFeed.css';

/* ====================================================
   SIMULATED DATA — rich fallback + supplemental items
   ==================================================== */
const SIMULATED_THREATS = [
    {
        id: 'sim-1',
        type: 'CVE',
        severity: 'CRITICAL',
        title: 'CVE-2024-3400: PAN-OS Command Injection (CVSS 10.0)',
        source: 'NVD',
        age: '2h ago',
        icon: 'server',
        detail: 'Zero-day in Palo Alto GlobalProtect allows unauthenticated RCE. Patch immediately.'
    },
    {
        id: 'sim-2',
        type: 'BREACH',
        severity: 'HIGH',
        title: 'Major Healthcare Provider: 4.5M patient records exposed',
        source: 'BleepingComputer',
        age: '5h ago',
        icon: 'database',
        detail: 'Ransomware group leaked SSNs, medical history, and insurance data on dark web.'
    },
    {
        id: 'sim-3',
        type: 'PHISHING',
        severity: 'HIGH',
        title: 'Active phishing campaign targeting Microsoft 365 users via OAuth',
        source: 'Proofpoint',
        age: '7h ago',
        icon: 'lock',
        detail: 'Attackers abuse OAuth consent flow to bypass MFA and gain persistent access.'
    },
    {
        id: 'sim-4',
        type: 'CVE',
        severity: 'CRITICAL',
        title: 'CVE-2024-21762: Fortinet FortiOS SSL VPN Auth Bypass (CVSS 9.6)',
        source: 'NVD',
        age: '1d ago',
        icon: 'wifi',
        detail: 'Out-of-bounds write allows unauthenticated attackers to execute arbitrary code.'
    },
    {
        id: 'sim-5',
        type: 'MALWARE',
        severity: 'MEDIUM',
        title: 'New infostealer "Lumma C2" active in fake CAPTCHA pages',
        source: 'Threat Intel',
        age: '9h ago',
        icon: 'globe',
        detail: 'Malware distributed via fake browser update prompts. Harvests crypto wallets & browser cookies.'
    },
    {
        id: 'sim-6',
        type: 'BREACH',
        severity: 'HIGH',
        title: 'Snowflake credential attack: 165 orgs affected via infostealer malware',
        source: 'Mandiant',
        age: '2d ago',
        icon: 'database',
        detail: 'Attackers used credentials stolen by malware (not MFA-protected) to exfiltrate data.'
    },
    {
        id: 'sim-7',
        type: 'CVE',
        severity: 'HIGH',
        title: 'CVE-2024-27198: JetBrains TeamCity Auth Bypass (CVSS 9.8)',
        source: 'NVD',
        age: '3d ago',
        icon: 'server',
        detail: 'Allows unauthenticated access to all TeamCity endpoints. Active exploitation observed.'
    },
    {
        id: 'sim-8',
        type: 'RANSOMWARE',
        severity: 'CRITICAL',
        title: 'LockBit 3.0 hits hospital network, disrupts patient care systems',
        source: 'CISA Alert',
        age: '4h ago',
        icon: 'lock',
        detail: 'Critical infrastructure attack. FBI warns of double-extortion: encryption + data leak.'
    },
    {
        id: 'sim-9',
        type: 'PHISHING',
        severity: 'MEDIUM',
        title: 'QR code phishing ("Quishing") bypasses email security filters',
        source: 'Microsoft Threat Intel',
        age: '6h ago',
        icon: 'globe',
        detail: 'Embedded QR codes used to redirect victims to credential-harvesting pages. Bypasses URL scanners.'
    },
    {
        id: 'sim-10',
        type: 'CVE',
        severity: 'CRITICAL',
        title: 'CVE-2024-1708: ConnectWise ScreenConnect Path Traversal (CVSS 8.4)',
        source: 'NVD',
        age: '5d ago',
        icon: 'server',
        detail: 'Allows remote attackers to traverse directories and execute code on vulnerable instances.'
    }
];

const SEVERITY_CONFIG = {
    CRITICAL: { color: '#ef4444', bg: '#ef444415', label: 'CRITICAL' },
    HIGH: { color: '#f97316', bg: '#f9731615', label: 'HIGH' },
    MEDIUM: { color: '#f59e0b', bg: '#f59e0b15', label: 'MEDIUM' },
    LOW: { color: '#22c55e', bg: '#22c55e15', label: 'LOW' },
};

const TYPE_CONFIG = {
    CVE: { color: '#ef4444', label: 'CVE' },
    BREACH: { color: '#8b5cf6', label: 'BREACH' },
    PHISHING: { color: '#f59e0b', label: 'PHISHING' },
    MALWARE: { color: '#ec4899', label: 'MALWARE' },
    RANSOMWARE: { color: '#ef4444', label: 'RANSOM' },
};

function getIcon(iconName, size = 14) {
    const props = { size };
    switch (iconName) {
        case 'server': return <Server {...props} />;
        case 'database': return <Database {...props} />;
        case 'lock': return <Lock {...props} />;
        case 'wifi': return <Wifi {...props} />;
        case 'globe': return <Globe {...props} />;
        default: return <ShieldAlert {...props} />;
    }
}

/* ====================================================
   TICKER COMPONENT (top of widget)
   ==================================================== */
function ThreatTicker({ items }) {
    const tickerRef = useRef(null);

    return (
        <div className="threat-ticker-wrapper">
            <div className="threat-ticker-label">
                <Radio size={12} className="ticker-pulse" /> LIVE
            </div>
            <div className="threat-ticker">
                <div className="threat-ticker-track" ref={tickerRef}>
                    {[...items, ...items].map((item, i) => (
                        <span key={i} className="ticker-item">
                            <span className="ticker-bullet" style={{ color: TYPE_CONFIG[item.type]?.color }}>●</span>
                            <span className="ticker-type" style={{ color: TYPE_CONFIG[item.type]?.color }}>
                                [{TYPE_CONFIG[item.type]?.label}]
                            </span>
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
    const sev = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.MEDIUM;
    const type = TYPE_CONFIG[item.type] || TYPE_CONFIG.CVE;

    return (
        <div className={`threat-card ${isNew ? 'threat-card-new' : ''}`}>
            <div className="threat-card-icon-col">
                <div className="threat-icon-wrapper" style={{ background: sev.bg, color: sev.color }}>
                    {getIcon(item.icon, 16)}
                </div>
            </div>
            <div className="threat-card-body">
                <div className="threat-card-meta">
                    <span className="threat-type-badge" style={{ color: type.color, background: `${type.color}18` }}>
                        {type.label}
                    </span>
                    <span className="threat-source">{item.source}</span>
                    <span className="threat-age">{item.age}</span>
                    {isNew && <span className="threat-new-badge">NEW</span>}
                </div>
                <div className="threat-card-title">{item.title}</div>
                {item.detail && (
                    <div className="threat-card-detail">{item.detail}</div>
                )}
            </div>
            <div className="threat-card-sev">
                <div className="sev-badge" style={{ color: sev.color, background: sev.bg, border: `1px solid ${sev.color}44` }}>
                    {sev.label}
                </div>
            </div>
        </div>
    );
}

/* ====================================================
   MAIN WIDGET
   ==================================================== */
export default function ThreatFeed() {
    const [threats, setThreats] = useState(SIMULATED_THREATS.slice(0, 6));
    const [newIds, setNewIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [stats, setStats] = useState({ critical: 0, high: 0, medium: 0 });

    // Try to fetch from NVD API, fallback to simulated
    const fetchThreats = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                'https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=5&cvssV3Severity=CRITICAL',
                { signal: AbortSignal.timeout(5000) }
            );
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            const mapped = data.vulnerabilities?.map(v => {
                const cve = v.cve;
                const cvss = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore;
                const severity = cvss >= 9 ? 'CRITICAL' : cvss >= 7 ? 'HIGH' : 'MEDIUM';
                const pub = new Date(cve.published);
                const hoursAgo = Math.round((Date.now() - pub) / 3600000);
                return {
                    id: cve.id,
                    type: 'CVE',
                    severity,
                    title: `${cve.id}: ${cve.descriptions?.find(d => d.lang === 'en')?.value?.slice(0, 80)}...`,
                    source: 'NVD',
                    age: hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`,
                    icon: 'server',
                    detail: cve.descriptions?.find(d => d.lang === 'en')?.value?.slice(0, 140)
                };
            }) || [];
            // Merge real + simulated
            const merged = [...mapped.slice(0, 3), ...SIMULATED_THREATS.slice(0, 5)];
            setThreats(merged);
            setNewIds(mapped.map(m => m.id));
        } catch {
            // Use simulated data
            setThreats(SIMULATED_THREATS);
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

    // Compute severity stats
    useEffect(() => {
        setStats({
            critical: threats.filter(t => t.severity === 'CRITICAL').length,
            high: threats.filter(t => t.severity === 'HIGH').length,
            medium: threats.filter(t => t.severity === 'MEDIUM').length,
        });
    }, [threats]);

    // Simulate a new threat arriving every 30s
    useEffect(() => {
        const interval = setInterval(() => {
            const randomThreat = SIMULATED_THREATS[Math.floor(Math.random() * SIMULATED_THREATS.length)];
            const newThreat = { ...randomThreat, id: `live-${Date.now()}`, age: 'Just now' };
            setThreats(prev => [newThreat, ...prev.slice(0, 7)]);
            setNewIds([newThreat.id]);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="threat-feed-widget">
            {/* Header */}
            <div className="threat-feed-header">
                <div className="threat-feed-title">
                    <div className="live-dot" />
                    <h2>Live Threat Intelligence</h2>
                    <span className="threat-feed-subtitle">Real-world CVEs & breaches</span>
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
                <a href="https://nvd.nist.gov/vuln/search" target="_blank" rel="noopener noreferrer" className="threat-feed-link">
                    <ExternalLink size={12} /> View full NVD database
                </a>
                <span className="threat-feed-disclaimer">Simulated + live CVE data for training purposes</span>
            </div>
        </div>
    );
}
