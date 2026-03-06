import { useState } from 'react';
import { Filter, Lock, Shield, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ScenarioCard from '../components/ScenarioCard';
import scenarios from '../data/scenarios';
import './Scenarios.css';

const categories = ['All', 'Phishing', 'Scam Calls', 'Malware', 'Social Engineering'];

export default function Scenarios() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeFilter, setActiveFilter] = useState('All');
    const [ugcScenarios, setUgcScenarios] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUgc();
    }, []);

    const fetchUgc = async () => {
        try {
            const res = await fetch('/api/ugc-scenarios');
            const data = await res.json();
            if (res.ok) setUgcScenarios(data);
        } catch (err) {
            console.error("Error fetching UGC:", err);
        }
    };

    const allScenarios = [...scenarios, ...ugcScenarios];

    const filtered = activeFilter === 'All'
        ? allScenarios
        : allScenarios.filter(s => s.category === activeFilter);

    if (!user) {
        return (
            <div className="scenarios-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', maxWidth: '500px' }}>
                    <Lock size={64} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Authentication Required</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.1rem' }}>
                        You must be logged in to access the interactive threat scenarios and earn XP.
                    </p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <Link to="/login" className="btn-primary" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
                            Log In
                        </Link>
                        <Link to="/signup" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', borderRadius: 'var(--radius-md)' }}>
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="scenarios-page">
            <div className="page-top-nav">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>
            </div>
            <div className="scenarios-header">
                <div className="header-content">
                    <h1>Threat Scenarios</h1>
                    <p>Choose a scenario and test your cyber defense skills</p>
                </div>
                <Link to="/builder" className="btn-primary create-scenario-btn">
                    <Plus size={18} /> Create Scenario
                </Link>
            </div>

            <div className="scenarios-filters">
                <Filter size={16} style={{ color: 'var(--text-muted)', alignSelf: 'center' }} />
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
                        onClick={() => setActiveFilter(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="scenarios-grid stagger">
                {filtered.length > 0 ? (
                    filtered.map(scenario => (
                        <ScenarioCard key={scenario.id} scenario={scenario} />
                    ))
                ) : (
                    <div className="scenarios-empty">No scenarios found in this category.</div>
                )}
            </div>
        </div>
    );
}
