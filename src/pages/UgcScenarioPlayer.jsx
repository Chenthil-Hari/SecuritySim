import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import ScenarioSimulator from '../components/ScenarioSimulator';
import { buildApiUrl } from '../utils/api';

export default function UgcScenarioPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScenario = async () => {
      try {
        const res = await fetch(buildApiUrl(`/api/ugc-scenarios/${id}`));
        if (res.ok) {
          const data = await res.json();
          // Transform content to match ScenarioSimulator expectations if needed
          // The ScenarioSimulator expects nodes: { "start": { ... }, "end_success": { ... } }
          // Our UgcScenario model stores it similarly but with a simplified array of options
          
          if (!data.nodes && data.content) {
            // Map UGC content to Node structure
            data.nodes = {
              "start": {
                text: data.content.visualData.body,
                options: data.content.options.map((opt, i) => ({
                    text: opt.text,
                    nextNodeId: opt.nextNodeId || (opt.isCorrect ? 'end_success' : 'end_fail'),
                    points: opt.isCorrect ? 50 : 0
                }))
              },
              "end_success": {
                text: "Mission Successful!",
                options: [],
                score: 50,
                isSuccess: true,
                explanation: data.content.educationalExplanation || "You completed the case successfully."
              },
              "end_fail": {
                 text: "Mission Failed.",
                 options: [],
                 score: 0,
                 isSuccess: false,
                 explanation: "You fell for the trap. Review the educational guidance and try again."
              }
            };
            data.maxScore = 50; // Default for UGC
          }
          
          setScenario(data);
        } else {
          setError("Scenario not found or not yet approved.");
        }
      } catch (err) {
        setError("Failed to link with HQ. Check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchScenario();
  }, [id]);

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#00ff88' }}>
        <Loader2 className="animate-spin" size={48} />
        <p style={{ marginTop: '1rem', fontFamily: 'Orbitron' }}>RETRIVING SCENARIO DATA...</p>
      </div>
    );
  }

  if (error || !scenario) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#fff' }}>
        <AlertTriangle size={64} color="#ff4757" style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ fontFamily: 'Orbitron', marginBottom: '1rem' }}>Access Denied</h2>
        <p style={{ color: '#b0bec5', marginBottom: '2rem' }}>{error || "The requested scenario data is unavailable or restricted."}</p>
        <button 
          onClick={() => navigate('/interactive-scenarios')}
          style={{ background: 'transparent', border: '1px solid #00ff88', color: '#00ff88', padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Orbitron', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
        >
          <ArrowLeft size={18} /> Return to Intel
        </button>
      </div>
    );
  }

  return (
    <ScenarioSimulator 
      scenario={scenario} 
      isReplay={false} 
      onClose={() => navigate('/interactive-scenarios')} 
    />
  );
}
