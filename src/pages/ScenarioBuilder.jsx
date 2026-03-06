import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Phone, HardDrive, ArrowLeft, ArrowRight, Save, Play, Plus, Trash2, AlertCircle } from 'lucide-react';
import './ScenarioBuilder.css';

const SCENARIO_TYPES = [
    { id: 'Phishing', icon: <Mail />, label: 'Phishing Email', color: 'var(--warning)', desc: 'Craft a deceptive email to trick users into clicking links or giving credentials.' },
    { id: 'Scam Calls', icon: <Phone />, label: 'Scam Call', color: 'var(--secondary)', desc: 'Design a vishing script that creates urgency or impersonates authority.' },
    { id: 'Malware', icon: <HardDrive />, label: 'Malware File', color: 'var(--danger)', desc: 'Create a suspicious file or download scenario to test system defenses.' }
];

export default function ScenarioBuilder() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [scenario, setScenario] = useState({
        title: '',
        category: 'Phishing',
        difficulty: 'Intermediate',
        description: '',
        content: {
            mainType: 'email',
            visualData: {
                sender: '',
                subject: '',
                body: '',
            },
            options: [
                { text: '', isCorrect: true, feedback: '', consequence: '' },
                { text: '', isCorrect: false, feedback: '', consequence: '' }
            ],
            educationalExplanation: ''
        }
    });

    const handleTypeSelect = (type) => {
        const mainType = type === 'Phishing' ? 'email' : type === 'Scam Calls' ? 'phone' : 'file';
        setScenario({ ...scenario, category: type, content: { ...scenario.content, mainType } });
    };

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...scenario.content.options];
        newOptions[index][field] = value;
        setScenario({ ...scenario, content: { ...scenario.content, options: newOptions } });
    };

    const addOption = () => {
        if (scenario.content.options.length < 4) {
            setScenario({
                ...scenario,
                content: {
                    ...scenario.content,
                    options: [...scenario.content.options, { text: '', isCorrect: false, feedback: '', consequence: '' }]
                }
            });
        }
    };

    const removeOption = (index) => {
        const newOptions = scenario.content.options.filter((_, i) => i !== index);
        setScenario({ ...scenario, content: { ...scenario.content, options: newOptions } });
    };

    const handlePublish = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/ugc-scenarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(scenario)
            });

            if (res.ok) {
                navigate('/scenarios');
            } else {
                const data = await res.json();
                alert('Error: ' + data.message);
            }
        } catch (err) {
            alert('Error publishing scenario: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="builder-page">
            <div className="builder-header">
                <button className="back-btn" onClick={() => navigate('/scenarios')}>
                    <ArrowLeft size={18} /> Exit Builder
                </button>
                <div className="step-indicator">
                    <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                    <div className="step-line"></div>
                    <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
                    <div className="step-line"></div>
                    <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
                </div>
            </div>

            <div className="builder-container animate-fade-in">
                {step === 1 && (
                    <div className="builder-step step-1">
                        <h2>Select Threat Type</h2>
                        <p>What kind of security challenge do you want to build?</p>
                        <div className="type-grid">
                            {SCENARIO_TYPES.map(type => (
                                <div 
                                    key={type.id} 
                                    className={`type-card ${scenario.category === type.id ? 'selected' : ''}`}
                                    onClick={() => handleTypeSelect(type.id)}
                                >
                                    <div className="type-icon" style={{ borderColor: type.color, color: type.color }}>
                                        {type.icon}
                                    </div>
                                    <h3>{type.label}</h3>
                                    <p>{type.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="builder-actions">
                            <button className="btn-primary" onClick={() => setStep(2)}>
                                Next: Details <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="builder-step step-2">
                        <h2>Scenario Identity</h2>
                        <div className="input-group">
                            <label>Scenario Title</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Urgent Bank Security Alert" 
                                value={scenario.title} 
                                onChange={(e) => setScenario({...scenario, title: e.target.value})}
                            />
                        </div>
                        <div className="input-group">
                            <label>Short Description</label>
                            <textarea 
                                placeholder="What is this scenario about?" 
                                value={scenario.description}
                                onChange={(e) => setScenario({...scenario, description: e.target.value})}
                            />
                        </div>
                        <div className="split-inputs">
                            <div className="input-group">
                                <label>Difficulty Level</label>
                                <select value={scenario.difficulty} onChange={(e) => setScenario({...scenario, difficulty: e.target.value})}>
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                            </div>
                        </div>
                        <div className="builder-actions">
                            <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                            <button className="btn-primary" onClick={() => setStep(3)} disabled={!scenario.title || !scenario.description}>
                                Next: Content <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="builder-step step-3">
                        <h2>Craft the Content</h2>
                        <div className="content-editor">
                            <div className="content-fields">
                                {scenario.category === 'Phishing' && (
                                    <>
                                        <div className="input-group">
                                            <label>Sender Address</label>
                                            <input 
                                                type="text" 
                                                placeholder="security@arnazon.com" 
                                                value={scenario.content.visualData.sender}
                                                onChange={(e) => setScenario({...scenario, content: {...scenario.content, visualData: {...scenario.content.visualData, sender: e.target.value}}})}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Email Subject</label>
                                            <input 
                                                type="text" 
                                                placeholder="Immediate Action Required" 
                                                value={scenario.content.visualData.subject}
                                                onChange={(e) => setScenario({...scenario, content: {...scenario.content, visualData: {...scenario.content.visualData, subject: e.target.value}}})}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Email Content (HTML/Markdown)</label>
                                            <textarea 
                                                className="body-editor"
                                                placeholder="Write the deceptive email body..." 
                                                value={scenario.content.visualData.body}
                                                onChange={(e) => setScenario({...scenario, content: {...scenario.content, visualData: {...scenario.content.visualData, body: e.target.value}}})}
                                            />
                                        </div>
                                    </>
                                )}
                                {/* Other types could follow similar high-quality structure */}
                            </div>

                            <div className="options-editor">
                                <h3><AlertCircle size={14} /> USER DECISIONS</h3>
                                {scenario.content.options.map((opt, i) => (
                                    <div key={i} className={`option-item ${opt.isCorrect ? 'correct' : 'incorrect'}`}>
                                        <div className="option-header">
                                            <label>
                                                {opt.isCorrect ? '✅ CORRECT ACTION' : '❌ MISTAKE / TRAP'}
                                            </label>
                                            {i > 1 && <button onClick={() => removeOption(i)} title="Remove option"><Trash2 size={14} /></button>}
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="Label (e.g. Click the link)" 
                                            value={opt.text}
                                            onChange={(e) => handleOptionChange(i, 'text', e.target.value)}
                                        />
                                        <textarea 
                                            placeholder="Feedback message to show user..." 
                                            value={opt.feedback}
                                            onChange={(e) => handleOptionChange(i, 'feedback', e.target.value)}
                                        />
                                    </div>
                                ))}
                                {scenario.content.options.length < 4 && (
                                    <button className="add-opt-btn" onClick={addOption}>
                                        <Plus size={16} /> Add distractor
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="explanation-editor">
                            <label><Shield size={18} /> Deep-Dive Explanation</label>
                            <textarea 
                                placeholder="Detail exactly why this is a threat and what red flags users should look for..." 
                                value={scenario.content.educationalExplanation}
                                onChange={(e) => setScenario({...scenario, content: {...scenario.content, educationalExplanation: e.target.value}})}
                            />
                        </div>

                        <div className="builder-actions">
                            <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
                            <button className="btn-publish" onClick={handlePublish} disabled={loading || !scenario.content.visualData.sender || !scenario.content.visualData.body}>
                                {loading ? 'Publishing...' : <><Save size={18} /> Deploy to Grid</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
