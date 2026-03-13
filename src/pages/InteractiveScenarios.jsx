import { useState } from 'react';
import { Shield, ChevronRight, PlayCircle, AlertTriangle, CheckCircle2, PlusCircle, Send, Info } from 'lucide-react';
import { interactiveScenarios } from '../data/interactiveScenarios';
import ScenarioSimulator from '../components/ScenarioSimulator';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../utils/api';
import './InteractiveScenarios.css';

export default function InteractiveScenarios() {
  const [activeScenario, setActiveScenario] = useState(null);
  const { user } = useAuth(); // Assume user must be logged in to view, handled by App.js usually

  const completedIds = user?.completedScenarios?.map(s => s.scenarioId) || [];

  const handleStartScenario = (scenario) => {
    setActiveScenario(scenario);
  };

  const handleCloseScenario = () => {
    setActiveScenario(null);
  };

  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [newScenario, setNewScenario] = useState({
    title: '',
    category: 'Phishing',
    difficulty: 'Beginner',
    description: '',
    content: {
      mainType: 'email',
      visualData: { 
        sender: '', 
        subject: '', 
        body: '', 
        link: '' 
      },
      options: [
        { text: '', isCorrect: true, feedback: '', nextNodeId: 'end_success' },
        { text: '', isCorrect: false, feedback: '', nextNodeId: 'end_fail' }
      ],
      educationalExplanation: ''
    }
  });

  const handleSubmitScenario = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl('/api/ugc-scenarios'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newScenario)
      });

      if (res.ok) {
        setSubmitStatus({ 
          type: 'success', 
          message: 'Scenario submitted successfully! It is now in the moderation queue.' 
        });
        setNewScenario({
          title: '',
          category: 'Phishing',
          difficulty: 'Beginner',
          description: '',
          content: {
            mainType: 'email',
            visualData: { sender: '', subject: '', body: '', link: '' },
            options: [
              { text: '', isCorrect: true, feedback: '', nextNodeId: 'end_success' },
              { text: '', isCorrect: false, feedback: '', nextNodeId: 'end_fail' }
            ],
            educationalExplanation: ''
          }
        });
        setTimeout(() => setShowSubmitForm(false), 3000);
      } else {
        const data = await res.json();
        setSubmitStatus({ type: 'error', message: data.message || 'Failed to submit scenario.' });
      }
    } catch (err) {
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  // If a scenario is active, render the simulator directly
  if (activeScenario) {
    const isCompleted = completedIds.includes(activeScenario.id);
    return <ScenarioSimulator scenario={activeScenario} isReplay={isCompleted} onClose={handleCloseScenario} />;
  }

  return (
    <div className="scenarios-list-container fade-in">
      <div className="scenarios-header">
        <h1><Shield className="header-icon" /> Interactive Cyber Cases</h1>
        <p>Step into the shoes of an Incident Responder. Your choices will determine the outcome of these critical security events.</p>
      </div>

      <div className="scenarios-grid">
        {interactiveScenarios.map((scenario) => {
          const isCompleted = completedIds.includes(scenario.id);
          return (
          <div key={scenario.id} className={`scenario-card ${isCompleted ? 'completed-card' : ''}`}>
            {isCompleted && (
               <div className="completed-overlay">
                 <div className="completed-content">
                    <CheckCircle2 size={40} className="completed-icon" />
                    <span>100% Completed</span>
                 </div>
               </div>
            )}
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
        )})}
      </div>

      <div className="submit-scenario-section">
        <div className="submit-card">
          {!showSubmitForm ? (
            <div className="submit-intro">
              <PlusCircle size={48} className="submit-icon" />
              <h3>Have a unique cyber attack story?</h3>
              <p>Create your own interactive scenario and help fellow investigators learn from your experience.</p>
              <button 
                className="toggle-submit-btn"
                onClick={() => setShowSubmitForm(true)}
              >
                Create New Case
              </button>
            </div>
          ) : (
            <div className="submit-form-container">
              <div className="form-header">
                <h3><PlusCircle size={20} /> Design Your Scenario</h3>
                <button className="close-form-btn" onClick={() => setShowSubmitForm(false)}>✕</button>
              </div>
              
              <form onSubmit={handleSubmitScenario} className="scenario-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Scenario Title</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. The Unexpected Package"
                      value={newScenario.title}
                      onChange={(e) => setNewScenario({...newScenario, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select 
                        value={newScenario.category}
                        onChange={(e) => setNewScenario({...newScenario, category: e.target.value})}
                      >
                        <option>Phishing</option>
                        <option>Scam Calls</option>
                        <option>Malware</option>
                        <option>Social Engineering</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Difficulty</label>
                      <select 
                        value={newScenario.difficulty}
                        onChange={(e) => setNewScenario({...newScenario, difficulty: e.target.value})}
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Public Description</label>
                  <textarea 
                    required 
                    placeholder="Short summary for the catalog..."
                    value={newScenario.description}
                    onChange={(e) => setNewScenario({...newScenario, description: e.target.value})}
                  />
                </div>

                <div className="form-section-title">
                  <Info size={16} /> Incident Content
                </div>

                <div className="form-group">
                  <label>The Threat Scenario (Initial Hub/Message)</label>
                  <textarea 
                    required 
                    placeholder="Describe the situation the user encounters..."
                    value={newScenario.content.visualData.body}
                    onChange={(e) => {
                      const updated = {...newScenario};
                      updated.content.visualData.body = e.target.value;
                      setNewScenario(updated);
                    }}
                  />
                </div>

                <div className="form-section-title">
                  <ChevronRight size={16} /> User Choices
                </div>

                <div className="options-grid">
                  <div className="option-input-block success">
                    <label>Correct Action</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Report and Delete"
                      value={newScenario.content.options[0].text}
                      onChange={(e) => {
                        const updated = {...newScenario};
                        updated.content.options[0].text = e.target.value;
                        setNewScenario(updated);
                      }}
                    />
                    <input 
                      type="text" 
                      placeholder="Success Feedback Message"
                      value={newScenario.content.options[0].feedback}
                      onChange={(e) => {
                        const updated = {...newScenario};
                        updated.content.options[0].feedback = e.target.value;
                        setNewScenario(updated);
                      }}
                    />
                  </div>

                  <div className="option-input-block failure">
                    <label>Malicious Traps (Incorrect Action)</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Click the Link"
                      value={newScenario.content.options[1].text}
                      onChange={(e) => {
                        const updated = {...newScenario};
                        updated.content.options[1].text = e.target.value;
                        setNewScenario(updated);
                      }}
                    />
                    <input 
                      type="text" 
                      placeholder="Failure Feedback Message"
                      value={newScenario.content.options[1].feedback}
                      onChange={(e) => {
                        const updated = {...newScenario};
                        updated.content.options[1].feedback = e.target.value;
                        setNewScenario(updated);
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Educational Explanation</label>
                  <textarea 
                    required 
                    placeholder="Explain the lesson learned..."
                    value={newScenario.content.educationalExplanation}
                    onChange={(e) => {
                      const updated = {...newScenario};
                      updated.content.educationalExplanation = e.target.value;
                      setNewScenario(updated);
                    }}
                  />
                </div>

                {submitStatus.message && (
                  <div className={`form-status ${submitStatus.type}`}>
                    {submitStatus.message}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="submit-final-btn"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Transmitting...' : <><Send size={18} /> Submit for Review</>}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Background elements */}
      <div className="bg-glow blob-1"></div>
      <div className="bg-glow blob-2"></div>
    </div>
  );
}
