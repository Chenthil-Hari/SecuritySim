import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Terminal, ShieldAlert, Cpu, Activity, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import './ScenarioSimulator.css';
import { buildApiUrl } from '../utils/api';

export default function ScenarioSimulator({ scenario, isReplay, onClose }) {
  const [currentNodeId, setCurrentNodeId] = useState("start");
  const [history, setHistory] = useState([]);
  const [typing, setTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [currentScore, setCurrentScore] = useState(0);
  const [scoreAwarded, setScoreAwarded] = useState(false);
  
  const bottomRef = useRef(null);
  
  const currentNode = scenario.nodes[currentNodeId];
  const isFinished = currentNode.options.length === 0;

  // Typewriter effect logic
  useEffect(() => {
    if (!currentNode) return;
    
    setTyping(true);
    setDisplayedText("");
    
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex < currentNode.text.length) {
        setDisplayedText(currentNode.text.substring(0, currentIndex + 1));
        currentIndex++;
        // Auto scroll as text is typing potentially
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      } else {
        clearInterval(intervalId);
        setTyping(false);
      }
    }, 15); // Adjust typing speed here

    return () => clearInterval(intervalId);
  }, [currentNodeId, currentNode]);

  // Handle score awarding on finish
  useEffect(() => {
    if (isFinished && !scoreAwarded && currentNode.score !== undefined) {
      const token = localStorage.getItem('token');
      if (token) {
        const finalTotalScore = currentScore + (currentNode.score || 0);

        const payload = {
          // Only send incremental score if it's NOT a replay
          ...(isReplay ? {} : { incrementalScore: finalTotalScore }),
          // Always send completion if it's the first time (though backend should handle idempotency)
          ...(!isReplay ? { 
            newCompletedScenario: { 
              scenarioId: scenario.id, 
              category: scenario.type,
              accuracy: Math.max(0, Math.floor((finalTotalScore / scenario.maxScore) * 100)),
              timestamp: new Date()
            } 
          } : {})
        };

        if (!isReplay || payload.newCompletedScenario) {
          fetch(buildApiUrl('/api/profile/sync'), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          }).catch(err => console.warn('Failed to sync state:', err));
        }
        
        setScoreAwarded(true);
      }
    }
  }, [isFinished, scoreAwarded, currentNode, currentScore]);

  const handleOptionClick = (option) => {
    if (typing) return; // Prevent clicking while text is typing
    
    // Add points for the choice
    if (option.points !== undefined) {
      setCurrentScore(prev => prev + option.points);
    }

    // Record history
    setHistory(prev => [...prev, {
      question: currentNode.text,
      choice: option.text,
      points: option.points || 0
    }]);
    
    // Advance to next node
    setCurrentNodeId(option.nextNodeId);
  };

  const handleRestart = () => {
    setCurrentNodeId("start");
    setHistory([]);
    setDisplayedText("");
    setCurrentScore(0);
    setScoreAwarded(false);
  };

  if (!currentNode) {
      return <div>Error: Scenario data corrupted. Missing node: {currentNodeId}</div>;
  }

  const finalTotalScore = isFinished ? currentScore + (currentNode.score || 0) : currentScore;

  return (
    <div className="simulator-container fade-in">
      <div className="sim-header">
        <button className="back-btn" onClick={onClose} aria-label="Exit Scenario">
          <ArrowLeft size={20} />
          <span>Exit Incident Team</span>
        </button>
        <div className="sim-title-area">
          <Terminal className="sim-icon" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <h2>Active Incident: {scenario.title}</h2>
             {scenario.type && <span style={{ color: '#90caf9', fontSize: '0.8rem', fontVariant: 'small-caps', letterSpacing: '1px' }}>Threat Vector: {scenario.type}</span>}
          </div>
        </div>
        <div className="sim-status-indicators" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {isReplay && (
            <span className="replay-tag" style={{ color: '#90caf9', fontSize: '0.7rem', border: '1px solid #90caf9', padding: '2px 6px', borderRadius: '4px' }}>
              REPLAY: NO SCORE
            </span>
          )}
          <span style={{ color: '#ffbd2e', fontFamily: 'Orbitron, sans-serif' }}>Score: {finalTotalScore}</span>
          <span className="pulse-indicator"><Activity size={16} /> Live Data</span>
        </div>
      </div>

      <div className="sim-main-content">
        <div className="terminal-window">
          <div className="terminal-header">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
            <span className="terminal-title">bash - root@SIEM-CONSOLE</span>
          </div>
          
          <div className="terminal-body" id="terminal-output">
             {/* History Log */}
            {history.map((log, index) => (
              <div key={index} className="history-block">
                <div className="sys-prompt">$ system_alert --read</div>
                <div className="sys-text prev-text">{log.question}</div>
                <div className="sys-prompt">$ user_response --input</div>
                <div className="user-choice {`> ${log.choice}`}">{`> ${log.choice}`}</div>
              </div>
            ))}
            
            {/* Current Active Prompt */}
            <div className="active-block">
               <div className="sys-prompt">$ system_alert --read --live</div>
               <div className="sys-text current-text">
                 {displayedText}
                 {typing && <span className="cursor-blink">_</span>}
               </div>
            </div>

            {/* Empty div to auto-scroll to bottom */}
            <div ref={bottomRef} style={{ height: "20px" }} />
          </div>
        </div>
      </div>

      <div className="sim-controls-panel">
         {!typing && !isFinished && (
           <div className="options-container fade-up">
              <h4 className="options-title"><Cpu size={16}/> Select Action:</h4>
              {currentNode.options.map((option, index) => (
                <button 
                  key={index} 
                  className="action-btn"
                  onClick={() => handleOptionClick(option)}
                >
                  <span className="btn-index">{(index + 1).toString().padStart(2, '0')}</span>
                  <span className="btn-text">{option.text}</span>
                </button>
              ))}
           </div>
         )}
         
         {isFinished && (
            <div className="wrap-up-container fade-up" style={{ textAlign: 'left', alignItems: 'flex-start' }}>
               <div className="wrap-up-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                 {currentNode.isSuccess ? 
                    <CheckCircle2 size={32} color="#00ff88" /> : 
                    <XCircle size={32} color="#ff4757" />
                 }
                 <div>
                    <h3 style={{ margin: 0, fontFamily: 'Orbitron, sans-serif', color: currentNode.isSuccess ? '#00ff88' : '#ff4757' }}>
                      {currentNode.isSuccess ? 'Response Successful' : 'Response Failed'}
                    </h3>
                    <div style={{ color: '#ffbd2e', fontWeight: 'bold', marginTop: '0.25rem' }}>
                       Final Score: {finalTotalScore} / {scenario.maxScore}
                    </div>
                 </div>
               </div>
               
               <div className="wrap-up-explanation" style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '6px', borderLeft: `3px solid ${currentNode.isSuccess ? '#00ff88' : '#ff4757'}`, marginBottom: '1.5rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                 <strong>After Action Report:</strong><br/>
                 {currentNode.explanation}
               </div>

               <button className="restart-btn" onClick={handleRestart} style={{ alignSelf: 'center' }}>
                 <RefreshCw size={18} /> Restart Simulation
               </button>
            </div>
         )}
      </div>
    </div>
  );
}
