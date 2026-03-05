import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Bug, Users, Video, Wifi, Briefcase, Shield, QrCode, UserPlus, HardDrive, Gamepad, Instagram, AlertOctagon, Heart, ShoppingBag, CheckCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import './ScenarioCard.css';

const iconMap = {
    Mail, Phone, Bug, Users, Video, Wifi, Briefcase, Shield, QrCode, UserPlus, HardDrive, Gamepad, Instagram, AlertOctagon, Heart, ShoppingBag
};

export default function ScenarioCard({ scenario }) {
    const navigate = useNavigate();
    const { completedScenarios } = useGame();

    const completed = completedScenarios.find(s => s.scenarioId === scenario.id);
    const Icon = iconMap[scenario.icon] || Mail;
    const categoryClass = scenario.category.toLowerCase().replace(/\s+/g, '-');

    return (
        <article
            className="scenario-card"
            onClick={() => navigate(`/scenarios/${scenario.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/scenarios/${scenario.id}`)}
            aria-label={`${scenario.title} - ${scenario.category} - Difficulty ${scenario.difficulty}`}
        >
            <div className="scenario-card-header">
                <div className="scenario-card-icon">
                    <Icon size={22} />
                </div>
                <span className={`scenario-card-badge ${categoryClass}`}>
                    {scenario.category}
                </span>
            </div>

            <h3 className="scenario-card-title">{scenario.title}</h3>
            <p className="scenario-card-desc">{scenario.description}</p>

            <div className="scenario-card-footer">
                <div className="scenario-card-difficulty" title={`Difficulty ${scenario.difficulty}/3`}>
                    {[1, 2, 3].map(d => (
                        <span
                            key={d}
                            className={`difficulty-dot ${d <= scenario.difficulty ? 'active' : ''}`}
                        />
                    ))}
                </div>

                {completed ? (
                    <span className="scenario-card-status completed">
                        <CheckCircle size={14} /> {completed.accuracy}%
                    </span>
                ) : (
                    <span className="scenario-card-status new">New</span>
                )}
            </div>
        </article>
    );
}
