import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Terminal, ShieldAlert, Cpu, Activity, RefreshCw } from 'lucide-react';
import './ScenarioSimulator.css';

export default function ScenarioSimulator({ scenario, onClose }) {
  const [currentNodeId, setCurrentNodeId] = useState("start");
  const [history, setHistory] = useState([]);
  const [typing, setTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  
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
            <div className="wrap-up-container fade-up">
               <div className="wrap-up-alert">
                 <ShieldAlert size={24} />
                 <h3>Incident Closed</h3>
               </div>
               <p>The system has logged your responses. Run post-mortem analysis or reset the simulation.</p>
               <button className="restart-btn" onClick={handleRestart}>
                 <RefreshCw size={18} /> Restart Scenario
               </button>
            </div>
         )}
      </div>
    </div>
  );
}
