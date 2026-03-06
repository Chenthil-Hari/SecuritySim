import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Terminal, ShieldAlert, Cpu, Activity, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import './ScenarioSimulator.css';
import { buildApiUrl } from '../utils/api';

export default function ScenarioSimulator({ scenario, onClose }) {
  const [currentNodeId, setCurrentNodeId] = useState("start");
  const [history, setHistory] = useState([]);
  const [typing, setTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
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
        // We make a direct API call to add the score. Assuming /api/profile/score exists or similar, 
        // if not, we rely on the visual aspect for now or game context. Let's try GameContext first.
        fetch(buildApiUrl('/api/profile/sync'), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          // Note: A robust implementation would have a specific endpoint for adding points.
          // This assumes the backend handles incremental score updates if we send it, 
          // or we can prompt the user that their score was recorded locally.
          body: JSON.stringify({
             incrementalScore: currentNode.score // backend would need to handle this
          })
        }).catch(err => console.warn('Failed to sync score:', err));
        
        setScoreAwarded(true);
      }
    }
  }, [isFinished, scoreAwarded, currentNode]);


  const handleOptionClick = (option) => {
    if (typing) return; // Prevent clicking while text is typing
    
    // Record history
    setHistory(prev => [...prev, {
      question: currentNode.text,
      choice: option.text
    }]);
    
    // Advance to next node
    setCurrentNodeId(option.nextNodeId);
  };

  const handleRestart = () => {
    setCurrentNodeId("start");
    setHistory([]);
    setDisplayedText("");
    setScoreAwarded(false);
  };

  if (!currentNode) {
      return <div>Error: Scenario data corrupted. Missing node: {currentNodeId}</div>;
  }

  return (
    <div className="simulator-container fade-in">
      <div className="sim-header">
        <button className="back-btn" onClick={onClose} aria-label="Exit Scenario">
          <ArrowLeft size={20} />
          <span>Exit Incident Team</span>
        </button>
        <div className="sim-title-area">
          <Terminal className="sim-icon" />
          <h2>Active Incident: {scenario.title}</h2>
        </div>
        <div className="sim-status-indicators">
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
                       Score: {currentNode.score} / {scenario.maxScore}
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
