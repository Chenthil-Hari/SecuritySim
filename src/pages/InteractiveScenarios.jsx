import { useState } from 'react';
import { Shield, ChevronRight, PlayCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { interactiveScenarios } from '../data/interactiveScenarios';
import ScenarioSimulator from '../components/ScenarioSimulator';
import { useAuth } from '../context/AuthContext';
import './InteractiveScenarios.css';

export default function InteractiveScenarios() {
  const [activeScenario, setActiveScenario] = useState(null);
  const { user } = useAuth(); // Assume user must be logged in to view, handled by App.js usually

  const handleStartScenario = (scenario) => {
    setActiveScenario(scenario);
  };

  const handleCloseScenario = () => {
    setActiveScenario(null);
  };

  // If a scenario is active, render the simulator directly
  if (activeScenario) {
    return <ScenarioSimulator scenario={activeScenario} onClose={handleCloseScenario} />;
  }

  return (
    <div className="scenarios-list-container fade-in">
      <div className="scenarios-header">
        <h1><Shield className="header-icon" /> Interactive Cyber Cases</h1>
        <p>Step into the shoes of an Incident Responder. Your choices will determine the outcome of these critical security events.</p>
      </div>

      <div className="scenarios-grid">
        {interactiveScenarios.map((scenario) => (
          <div key={scenario.id} className="scenario-card">
            <div className="scene-card-header">
              <span className={`difficulty-badge ${scenario.difficulty.toLowerCase()}`}>
                {scenario.difficulty}
              </span>
              {scenario.type && (
                 <span className="type-badge">
                   {scenario.type}
                 </span>
              )}
              <h3>{scenario.title}</h3>
            </div>
            
            <div className="scene-card-body">
              <p>{scenario.description}</p>
            </div>
            
            <div className="scene-card-footer">
              <button 
                className="start-scenario-btn"
                onClick={() => handleStartScenario(scenario)}
              >
                <PlayCircle size={18} /> Begin Simulation
              </button>
            </div>
            
            <div className="hologram-effect"></div>
          </div>
        ))}
      </div>
      
      {/* Background elements */}
      <div className="bg-glow blob-1"></div>
      <div className="bg-glow blob-2"></div>
    </div>
  );
}
