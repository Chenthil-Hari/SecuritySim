import { useMemo } from 'react';
import { Mail, Phone, Bug, Users, Lock, CheckCircle, Star, Zap, ChevronRight, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import './SkillTree.css';

/* ====================================================
   SKILL TREE DEFINITION
   Each skill: id, name, description, category, xpRequired,
   requiresIds[], tier (0=root, 1, 2...), icon, color
   ==================================================== */

const SKILL_BRANCHES = [
    {
        id: 'phishing',
        name: 'Phishing Defense',
        color: '#f59e0b',
        icon: Mail,
        skills: [
            {
                id: 'phish-1',
                tier: 0,
                name: 'Phishing Awareness',
                desc: 'Recognize basic phishing emails: suspicious senders, fake links, urgent language.',
                xpRequired: 0,
                categoryRequired: 'Phishing',
                accuracyRequired: 0,
                requiresIds: [],
                reward: '+15 XP Multiplier on Phishing',
            },
            {
                id: 'phish-2',
                tier: 1,
                name: 'Spear Phishing Defense',
                desc: 'Detect targeted attacks using personal info harvested from social media.',
                xpRequired: 30,
                categoryRequired: 'Phishing',
                accuracyRequired: 60,
                requiresIds: ['phish-1'],
                reward: '+Unlock: CEO Fraud scenarios',
            },
            {
                id: 'phish-3',
                tier: 2,
                name: 'BEC Expert',
                desc: 'Business Email Compromise — identify fake invoice fraud and wire transfer scams.',
                xpRequired: 80,
                categoryRequired: 'Phishing',
                accuracyRequired: 80,
                requiresIds: ['phish-2'],
                reward: '+Unlock: Advanced Phishing badge',
            },
        ],
    },
    {
        id: 'social',
        name: 'Social Engineering',
        color: '#06b6d4',
        icon: Users,
        skills: [
            {
                id: 'se-1',
                tier: 0,
                name: 'Trust & Verify',
                desc: 'Understand the 6 principles of influence that attackers exploit.',
                xpRequired: 0,
                categoryRequired: 'Social Engineering',
                accuracyRequired: 0,
                requiresIds: [],
                reward: 'Unlock: SE scenario category',
            },
            {
                id: 'se-2',
                tier: 1,
                name: 'Pretexting Defense',
                desc: 'Recognize elaborate fabricated scenarios used to extract sensitive info.',
                xpRequired: 25,
                categoryRequired: 'Social Engineering',
                accuracyRequired: 60,
                requiresIds: ['se-1'],
                reward: '+20% accuracy bonus on SE scenarios',
            },
            {
                id: 'se-3',
                tier: 2,
                name: 'Red Team Resilience',
                desc: 'Defend against combined technical + human attack chains. The hardest defense.',
                xpRequired: 70,
                categoryRequired: 'Social Engineering',
                accuracyRequired: 75,
                requiresIds: ['se-2'],
                reward: 'Unlock: "Red Team" profile badge',
            },
        ],
    },
    {
        id: 'malware',
        name: 'Malware Response',
        color: '#ef4444',
        icon: Bug,
        skills: [
            {
                id: 'mal-1',
                tier: 0,
                name: 'Malware Recognition',
                desc: 'Identify infected files, suspicious processes, and malware delivery vectors.',
                xpRequired: 0,
                categoryRequired: 'Malware',
                accuracyRequired: 0,
                requiresIds: [],
                reward: 'Unlock: Malware category scenarios',
            },
            {
                id: 'mal-2',
                tier: 1,
                name: 'Ransomware Containment',
                desc: 'Understand encryption, lateral movement, and proper incident response steps.',
                xpRequired: 20,
                categoryRequired: 'Malware',
                accuracyRequired: 55,
                requiresIds: ['mal-1'],
                reward: '+Incident response bonus XP',
            },
            {
                id: 'mal-3',
                tier: 2,
                name: 'Zero-Day Awareness',
                desc: 'Recognize novel attacks without known signatures. Behavioral detection.',
                xpRequired: 60,
                categoryRequired: 'Malware',
                accuracyRequired: 70,
                requiresIds: ['mal-2'],
                reward: 'Unlock: "Zero Day" elite badge',
            },
        ],
    },
    {
        id: 'scam',
        name: 'Scam Call Defense',
        color: '#8b5cf6',
        icon: Phone,
        skills: [
            {
                id: 'scam-1',
                tier: 0,
                name: 'Call Screening 101',
                desc: 'Spot spoofed caller IDs, scripted urgency, and impersonation tactics.',
                xpRequired: 0,
                categoryRequired: 'Scam Calls',
                accuracyRequired: 0,
                requiresIds: [],
                reward: 'Unlock: Scam Calls category',
            },
            {
                id: 'scam-2',
                tier: 1,
                name: 'Vishing Defense',
                desc: 'Handle voice phishing: OTP extraction, fake bank transfers, tech support scams.',
                xpRequired: 20,
                categoryRequired: 'Scam Calls',
                accuracyRequired: 55,
                requiresIds: ['scam-1'],
                reward: '+Guard mode on Scam scenarios',
            },
            {
                id: 'scam-3',
                tier: 2,
                name: 'AI Voice Clone Defense',
                desc: 'Detect AI-synthesized voice clones used to bypass identity verification.',
                xpRequired: 55,
                categoryRequired: 'Scam Calls',
                accuracyRequired: 70,
                requiresIds: ['scam-2'],
                reward: 'Unlock: "AI Defender" badge',
            },
        ],
    },
];

/* ====================================================
   HELPERS
   ==================================================== */

function getSkillStatus(skill, xp, completedScenarios, unlockedSkillIds) {
    // 'mastered' if explicitly in unlockedSkills state
    if (unlockedSkillIds.includes(skill.id)) return 'mastered';

    // Check prerequisites
    const prereqsMet = skill.requiresIds.every(rid => unlockedSkillIds.includes(rid));
    if (!prereqsMet) return 'locked';

    // Check XP
    if (xp < skill.xpRequired) return 'locked';

    // Check category accuracy
    const catScenarios = completedScenarios.filter(s => s.category === skill.categoryRequired);
    const avgAccuracy = catScenarios.length > 0
        ? Math.round(catScenarios.reduce((sum, s) => sum + s.accuracy, 0) / catScenarios.length)
        : 0;

    if (avgAccuracy < skill.accuracyRequired) return 'locked';
    if (catScenarios.length === 0 && skill.accuracyRequired === 0) return 'available';

    return catScenarios.length > 0 ? 'available' : 'locked';
}

/* ====================================================
   SKILL NODE COMPONENT
   ==================================================== */

function SkillNode({ skill, status, color, isLast }) {
    const statusConfig = {
        mastered: { borderColor: color, bg: `${color}22`, iconColor: color, icon: CheckCircle, label: 'Mastered' },
        available: { borderColor: color, bg: `${color}10`, iconColor: color, icon: Star, label: 'Available' },
        locked: { borderColor: 'var(--border-color)', bg: 'transparent', iconColor: 'var(--text-muted)', icon: Lock, label: 'Locked' },
    };
    const cfg = statusConfig[status];
    const StatusIcon = cfg.icon;

    return (
        <div className={`skill-node-wrapper ${isLast ? '' : 'has-connector'}`}>
            <div
                className={`skill-node skill-node-${status}`}
                style={{
                    borderColor: cfg.borderColor,
                    background: cfg.bg,
                    boxShadow: status !== 'locked' ? `0 0 20px ${color}25` : 'none',
                }}
            >
                <div className="skill-node-header">
                    <div className="skill-tier-badge" style={{ color: cfg.iconColor }}>
                        <StatusIcon size={14} />
                        <span>{cfg.label}</span>
                    </div>
                </div>
                <h4 className="skill-node-name" style={{ color: status === 'locked' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {skill.name}
                </h4>
                <p className="skill-node-desc">{skill.desc}</p>
                {status !== 'locked' && (
                    <div className="skill-node-reward" style={{ color, background: `${color}15` }}>
                        <Zap size={11} /> {skill.reward}
                    </div>
                )}
                {status === 'locked' && (
                    <div className="skill-node-req">
                        {skill.xpRequired > 0 && <span><Zap size={10} /> {skill.xpRequired} XP</span>}
                        {skill.accuracyRequired > 0 && <span><Star size={10} /> {skill.accuracyRequired}% accuracy</span>}
                    </div>
                )}
            </div>
            {!isLast && (
                <div className={`skill-connector ${status !== 'locked' ? 'connector-active' : ''}`} style={{ '--color': color }}>
                    <ChevronRight size={18} />
                </div>
            )}
        </div>
    );
}

/* ====================================================
   BRANCH ROW COMPONENT
   ==================================================== */

function SkillBranch({ branch, xp, completedScenarios, unlockedSkillIds }) {
    const Icon = branch.icon;
    const masteredCount = branch.skills.filter(s =>
        getSkillStatus(s, xp, completedScenarios, unlockedSkillIds) === 'mastered'
    ).length;
    const progress = Math.round((masteredCount / branch.skills.length) * 100);

    return (
        <div className="skill-branch">
            <div className="skill-branch-header">
                <div className="skill-branch-icon" style={{ background: `${branch.color}20`, color: branch.color }}>
                    <Icon size={20} />
                </div>
                <div className="skill-branch-info">
                    <h3 className="skill-branch-name">{branch.name}</h3>
                    <div className="skill-branch-progress-track">
                        <div
                            className="skill-branch-progress-fill"
                            style={{ width: `${progress}%`, background: branch.color }}
                        />
                    </div>
                </div>
                <div className="skill-branch-stat" style={{ color: branch.color }}>
                    {masteredCount}/{branch.skills.length}
                </div>
            </div>

            <div className="skill-nodes-row">
                {branch.skills.map((skill, i) => (
                    <SkillNode
                        key={skill.id}
                        skill={skill}
                        status={getSkillStatus(skill, xp, completedScenarios, unlockedSkillIds)}
                        color={branch.color}
                        isLast={i === branch.skills.length - 1}
                    />
                ))}
            </div>
        </div>
    );
}

/* ====================================================
   MAIN PAGE
   ==================================================== */

export default function SkillTree() {
    const { xp, level, completedScenarios, unlockedSkills } = useGame();

    const totalSkills = SKILL_BRANCHES.reduce((s, b) => s + b.skills.length, 0);
    const masteredTotal = useMemo(() => {
        let count = 0;
        SKILL_BRANCHES.forEach(branch => {
            branch.skills.forEach(skill => {
                if (getSkillStatus(skill, xp, completedScenarios, unlockedSkills || []) === 'mastered') count++;
            });
        });
        return count;
    }, [xp, completedScenarios, unlockedSkills]);

    return (
        <div className="skill-tree-page">
            <div className="skill-tree-header">
                <Link to="/dashboard" className="skill-tree-back"><ArrowLeft size={16} /> Dashboard</Link>
                <div className="skill-tree-title-block">
                    <div className="skill-tree-icon-wrapper">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h1>Skill Tree</h1>
                        <p>Master each attack category to unlock new paths</p>
                    </div>
                </div>
                <div className="skill-tree-meta">
                    <div className="skill-meta-pill">
                        <CheckCircle size={14} /> {masteredTotal}/{totalSkills} mastered
                    </div>
                    <div className="skill-meta-pill">
                        <Zap size={14} /> {xp} XP total
                    </div>
                    <div className="skill-meta-pill">
                        <Star size={14} /> Level {level}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="skill-tree-legend">
                <div className="legend-item"><span className="legend-dot dot-mastered" /> Mastered</div>
                <div className="legend-item"><span className="legend-dot dot-available" /> Available to unlock</div>
                <div className="legend-item"><span className="legend-dot dot-locked" /> Locked</div>
            </div>

            {/* Branches */}
            <div className="skill-branches">
                {SKILL_BRANCHES.map(branch => (
                    <SkillBranch
                        key={branch.id}
                        branch={branch}
                        xp={xp}
                        completedScenarios={completedScenarios}
                        unlockedSkillIds={unlockedSkills || []}
                    />
                ))}
            </div>

            {/* Call to action */}
            <div className="skill-tree-cta">
                <Shield size={24} />
                <div>
                    <h3>Keep Training to Unlock Skills</h3>
                    <p>Complete scenarios in each category and hit accuracy thresholds to master the tree</p>
                </div>
                <Link to="/scenarios" className="btn-primary">Go to Scenarios →</Link>
            </div>
        </div>
    );
}
