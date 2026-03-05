import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, CheckCircle, Play, Info, ChevronRight, Target, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { campaignData } from '../data/campaign';
import './Campaign.css';

export default function Campaign() {
    const navigate = useNavigate();
    const state = useGame();
    const { campaignState } = state || {};
    const [selectedStage, setSelectedStage] = useState(null);

    useEffect(() => {
        if (campaignState && campaignData.stages) {
            // Default to current stage or first stage
            const currentStageObj = campaignData.stages.find(s => s.id === campaignState.currentStage);
            if (currentStageObj) {
                setSelectedStage(currentStageObj);
            } else if (campaignData.stages.length > 0) {
                setSelectedStage(campaignData.stages[0]);
            }
        }
    }, [campaignState?.currentStage]);

    if (!campaignState) return <div className="loading">Loading Campaign State...</div>;

    const isUnlocked = (stageId) => {
        return stageId <= campaignState.currentStage;
    };

    const isCompleted = (stageId) => {
        return campaignState.stagesCompleted.includes(stageId);
    };

    return (
        <div className="campaign-page">
            <div className="campaign-header">
                <Link to="/scenarios" className="back-link">
                    <ArrowLeft size={16} /> All Scenarios
                </Link>
                <h1>{campaignData.title}</h1>
                <p className="season-label">Season {campaignData.season}: {campaignData.description}</p>
            </div>

            <div className="campaign-container">
                {/* Map View */}
                <div className="campaign-map-wrapper">
                    <div className="campaign-map">
                        {/* Connection Lines (SVG) */}
                        <svg className="map-lines">
                            {campaignData.stages.slice(0, -1).map((stage, i) => {
                                const nextStage = campaignData.stages[i + 1];
                                return (
                                    <line
                                        key={i}
                                        x1={`${stage.position.x}%`}
                                        y1={`${stage.position.y}%`}
                                        x2={`${nextStage.position.x}%`}
                                        y2={`${nextStage.position.y}%`}
                                        className={isUnlocked(nextStage.id) ? 'line-unlocked' : 'line-locked'}
                                    />
                                );
                            })}
                        </svg>

                        {/* Stage Nodes */}
                        {campaignData.stages.map((stage) => {
                            const unlocked = isUnlocked(stage.id);
                            const completed = isCompleted(stage.id);
                            const active = selectedStage?.id === stage.id;
                            const current = campaignState.currentStage === stage.id;

                            return (
                                <div
                                    key={stage.id}
                                    className={`stage-node ${unlocked ? 'unlocked' : 'locked'} ${completed ? 'completed' : ''} ${active ? 'active' : ''} ${current ? 'current' : ''}`}
                                    style={{ left: `${stage.position.x}%`, top: `${stage.position.y}%` }}
                                    onClick={() => unlocked && setSelectedStage(stage)}
                                >
                                    <div className="node-icon">
                                        {completed ? <CheckCircle size={20} /> : unlocked ? <Play size={20} /> : <Lock size={20} />}
                                    </div>
                                    <div className="node-label">Stage {stage.id}</div>
                                    {current && <div className="node-pulse" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Briefing Panel */}
                <div className="campaign-briefing">
                    {selectedStage ? (
                        <div className="briefing-content animate-fadeIn">
                            <div className="briefing-header">
                                <span className={`stage-type ${selectedStage.type}`}>
                                    {selectedStage.type.toUpperCase()}
                                </span>
                                <h2>{selectedStage.title}</h2>
                            </div>

                            <div className="briefing-story">
                                <p>{selectedStage.storyIntro}</p>
                            </div>

                            <div className="briefing-stats">
                                <div className="b-stat">
                                    <Target size={16} />
                                    <span>Goal: {selectedStage.description}</span>
                                </div>
                                <div className="b-stat">
                                    <Shield size={16} />
                                    <span>Threat: High Complexity</span>
                                </div>
                            </div>

                            <div className="briefing-actions">
                                <button
                                    className="btn-primary start-btn"
                                    onClick={() => navigate(`/scenarios/${selectedStage.scenarioId}?campaignMode=true&stageId=${selectedStage.id}`)}
                                >
                                    Launch Mission
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="briefing-placeholder">
                            <Info size={48} className="placeholder-icon" />
                            <h3>Select an Unlocked Stage</h3>
                            <p>Follow the path to stop the Black Byte ransomware gang.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
