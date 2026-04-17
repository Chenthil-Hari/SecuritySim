import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Terminal, ShieldAlert, Cpu, Activity, RefreshCw, CheckCircle2, XCircle, Download, Mail } from 'lucide-react';
import './ScenarioSimulator.css';
import { buildApiUrl } from '../utils/api';
import { downloadCertificate, emailCertificate } from '../utils/CertificateGenerator';

import { useGameDispatch } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';

export default function ScenarioSimulator({ scenario, isReplay, onClose }) {
  const [currentNodeId, setCurrentNodeId] = useState("start");
  const [history, setHistory] = useState([]);
  const [typing, setTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [currentScore, setCurrentScore] = useState(0);
  const [scoreAwarded, setScoreAwarded] = useState(false);
  const [certStatus, setCertStatus] = useState(''); // '' | 'sending' | 'sent' | 'error'
  const [downloadingCert, setDownloadingCert] = useState(false);
  
  const bottomRef = useRef(null);
  const dispatch = useGameDispatch();
  const { updateUser } = useAuth();
  
  const currentNode = scenario.nodes[currentNodeId];
  const isFinished = currentNode?.options?.length === 0;

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
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      } else {
        clearInterval(intervalId);
        setTyping(false);
      }
    }, 15);

    return () => clearInterval(intervalId);
  }, [currentNodeId, currentNode]);

  // Handle score awarding on finish
  useEffect(() => {
    if (isFinished && !scoreAwarded && currentNode.score !== undefined) {
      // CAP the score at maxScore to prevent 200/100
      const rawFinalScore = currentScore + (currentNode.score || 0);
      const finalTotalScore = Math.min(scenario.maxScore, rawFinalScore);

      if (!isReplay) {
        // Dispatch to global context to handle XP and Leveling
        dispatch({
          type: 'COMPLETE_SCENARIO',
          payload: {
            scenarioId: scenario.id,
            score: finalTotalScore,
            category: scenario.type
          }
        });

        // Sync to backend
        const token = localStorage.getItem('token');
        if (token) {
          fetch(buildApiUrl('/api/profile/sync'), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              incrementalScore: finalTotalScore,
              newCompletedScenario: { 
                scenarioId: scenario.id, 
                category: scenario.type,
                accuracy: Math.max(0, Math.min(100, Math.floor((finalTotalScore / scenario.maxScore) * 100))),
                timestamp: new Date()
              }
            })
          })
          .then(res => res.json())
          .then(data => {
            if (data.user) {
              updateUser(data.user);
            }
          })
          .catch(err => console.warn('Backend sync failed:', err));
        }

        // Send certificate email on successful completion
        if (currentNode.isSuccess) {
          setCertStatus('sending');
          emailCertificate({ scenarioTitle: scenario.title })
            .then(result => {
              setCertStatus(result.success ? 'sent' : 'error');
            })
            .catch(() => setCertStatus('error'));
        }
      }
      
      setScoreAwarded(true);
    }
  }, [isFinished, scoreAwarded, currentNode, currentScore, isReplay, scenario, dispatch]);

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
    setCertStatus('');
    setDownloadingCert(false);
  };

  const handleDownloadCertificate = async () => {
    if (!user) return;
    setDownloadingCert(true);
    try {
      const completionDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      await downloadCertificate({
        userName: user.username,
        scenarioTitle: scenario.title,
        completionDate
      });
    } catch (err) {
      console.error('Certificate download error:', err);
    } finally {
      setDownloadingCert(false);
    }
  };

  if (!currentNode) {
      return <div>Error: Scenario data corrupted. Missing node: {currentNodeId}</div>;
  }

  const rawFinalScore = isFinished ? currentScore + (currentNode.score || 0) : currentScore;
  const finalTotalScore = Math.min(scenario.maxScore, rawFinalScore);

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
                <div className="user-choice">{`> ${log.choice}`}</div>
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

               {/* Certificate actions — only on success & first-time */}
               {currentNode.isSuccess && !isReplay && (
                 <div style={{ width: '100%', marginBottom: '0.5rem' }}>
                   <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                     <button onClick={handleDownloadCertificate} disabled={downloadingCert} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'rgba(201, 168, 76, 0.15)', border: '1px solid #c9a84c', color: '#c9a84c', borderRadius: '4px', cursor: downloadingCert ? 'wait' : 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '0.95rem' }}>
                       <Download size={18} /> {downloadingCert ? 'Generating...' : 'Download Certificate'}
                     </button>
                   </div>
                   {certStatus === 'sending' && (
                     <p style={{ textAlign: 'center', color: '#90caf9', fontSize: '0.85rem', marginTop: '0.5rem', animation: 'pulse 1.5s infinite' }}>
                       <Mail size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Sending certificate to your email...
                     </p>
                   )}
                   {certStatus === 'sent' && (
                     <p style={{ textAlign: 'center', color: '#00ff88', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                       📧 Certificate sent to your email!
                     </p>
                   )}
                   {certStatus === 'error' && (
                     <p style={{ textAlign: 'center', color: '#ff4757', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                       ⚠️ Could not send email. You can still download the certificate above.
                     </p>
                   )}
                 </div>
               )}

               <div className="wrap-up-actions" style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                 <button className="back-catalog-btn" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'rgba(144, 202, 249, 0.1)', border: '1px solid #90caf9', color: '#90caf9', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>
                   <ArrowLeft size={18} /> Back to Catalog
                 </button>
                 <button className="restart-btn" onClick={handleRestart} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'rgba(0, 255, 136, 0.1)', border: '1px solid #00ff88', color: '#00ff88', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>
                   <RefreshCw size={18} /> Restart Simulation
                 </button>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
