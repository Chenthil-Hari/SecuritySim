import { useEffect } from 'react';
import { useGame, useGameDispatch } from '../context/GameContext';
import { playClick, playScenarioComplete } from '../utils/soundEffects';
import skillsData from '../data/skills';
import './SkillTree.css';

export default function SkillTree() {
    const { state } = useGame();
    const dispatch = useGameDispatch();

    const unlockSkill = (skill) => {
        if (state.skillPoints < skill.cost) return;

        // Check prerequisites
        const meetsPrereqs = skill.prerequisites.every(pre => state.unlockedSkills.includes(pre));
        if (!meetsPrereqs) return;

        if (state.settings?.soundEffects) {
            playScenarioComplete(); // Upgrade sound
        }

        dispatch({ type: 'SPEND_SKILL_POINT', payload: skill.id });
    };

    const isUnlocked = (skillId) => state.unlockedSkills.includes(skillId);

    const canUnlock = (skill) => {
        if (isUnlocked(skill.id)) return false;
        if (state.skillPoints < skill.cost) return false;
        return skill.prerequisites.every(pre => isUnlocked(pre));
    };

    return (
        <div className="skill-tree-page">
            <header className="skill-tree-header">
                <div className="header-meta">
                    <h1>Agent Skill Tree</h1>
                    <p>Spend Skill Points to unlock permanent passive bonuses.</p>
                </div>
                <div className="sp-counter">
                    <span className="sp-number">{state.skillPoints}</span>
                    <span className="sp-label">Skill Points Available</span>
                </div>
            </header>

            <div className="skill-tree-grid">
                {/* SVG connection lines would go here natively, but for a web app, CSS Grid with absolute positioned borders is cleaner */}
                <div className="tree-container">
                    {skillsData.map(skill => {
                        const Icon = skill.icon;
                        const unlocked = isUnlocked(skill.id);
                        const available = canUnlock(skill);

                        return (
                            <div
                                key={skill.id}
                                className={`skill-node ${unlocked ? 'unlocked' : ''} ${available ? 'available' : ''} ${!unlocked && !available ? 'locked' : ''}`}
                                style={{ gridColumn: skill.position.x, gridRow: skill.position.y }}
                                onClick={() => {
                                    if (available) unlockSkill(skill);
                                    else if (state.settings?.soundEffects) playClick();
                                }}
                            >
                                <div className="skill-icon-wrapper">
                                    <Icon size={28} />
                                </div>
                                <div className="skill-info">
                                    <h3>{skill.name}</h3>
                                    <span className="skill-cost">{skill.cost} SP</span>
                                </div>
                                <div className="skill-tooltip">
                                    <h4>{skill.name}</h4>
                                    <p>{skill.description}</p>
                                    {!unlocked && !available && skill.prerequisites.length > 0 && (
                                        <p className="prereq-warning">Requires: {skill.prerequisites.map(p => skillsData.find(s => s.id === p)?.name).join(', ')}</p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
