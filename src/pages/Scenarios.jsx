import { useState } from 'react';
import { Filter } from 'lucide-react';
import ScenarioCard from '../components/ScenarioCard';
import scenarios from '../data/scenarios';
import './Scenarios.css';

const categories = ['All', 'Phishing', 'Scam Calls', 'Malware', 'Social Engineering'];

export default function Scenarios() {
    const [activeFilter, setActiveFilter] = useState('All');

    const filtered = activeFilter === 'All'
        ? scenarios
        : scenarios.filter(s => s.category === activeFilter);

    return (
        <div className="scenarios-page">
            <div className="scenarios-header">
                <h1>Threat Scenarios</h1>
                <p>Choose a scenario and test your cyber defense skills</p>
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
