import { useEffect, useState } from 'react';
import { Smartphone, Monitor, Laptop } from 'lucide-react';
import './Character.css';

/* 
  SVG Character Avatar
  Renders a stylized head + shoulders illustration with dynamic facial expressions
*/
function CharacterAvatar({ character, reaction }) {
    const { skinColor, hairColor, shirtColor, accessory, ageGroup } = character;

    // Expression-based eye + mouth geometry
    const expressions = {
        idle: {
            leftEye: <ellipse cx="38" cy="42" rx="3" ry="3.5" fill="#1a1a2e" />,
            rightEye: <ellipse cx="62" cy="42" rx="3" ry="3.5" fill="#1a1a2e" />,
            mouth: <path d="M 42 58 Q 50 62 58 58" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round" />,
            brows: null
        },
        thinking: {
            leftEye: <ellipse cx="38" cy="42" rx="3" ry="3.5" fill="#1a1a2e" />,
            rightEye: <ellipse cx="62" cy="42" rx="3" ry="3.5" fill="#1a1a2e" />,
            mouth: <path d="M 44 59 Q 50 57 56 59" stroke="#1a1a2e" strokeWidth="1.8" fill="none" strokeLinecap="round" />,
            brows: (
                <>
                    <line x1="33" y1="35" x2="43" y2="36" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
                    <line x1="57" y1="36" x2="67" y2="34" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
                </>
            )
        },
        confused: {
            leftEye: <ellipse cx="38" cy="42" rx="3.5" ry="4" fill="#1a1a2e" />,
            rightEye: <ellipse cx="62" cy="42" rx="3.5" ry="4" fill="#1a1a2e" />,
            mouth: <path d="M 43 59 Q 48 56 53 59 Q 56 61 58 58" stroke="#1a1a2e" strokeWidth="1.8" fill="none" strokeLinecap="round" />,
            brows: (
                <>
                    <line x1="33" y1="34" x2="43" y2="37" stroke="#1a1a2e" strokeWidth="2.2" strokeLinecap="round" />
                    <line x1="57" y1="37" x2="67" y2="33" stroke="#1a1a2e" strokeWidth="2.2" strokeLinecap="round" />
                </>
            )
        },
        panic: {
            leftEye: <ellipse cx="38" cy="42" rx="4" ry="5" fill="#1a1a2e" />,
            rightEye: <ellipse cx="62" cy="42" rx="4" ry="5" fill="#1a1a2e" />,
            mouth: <ellipse cx="50" cy="61" rx="6" ry="4.5" fill="#1a1a2e" />,
            brows: (
                <>
                    <line x1="31" y1="33" x2="43" y2="35" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="57" y1="35" x2="69" y2="33" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
                </>
            )
        },
        relief: {
            leftEye: <path d="M 34 42 Q 38 39 42 42" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
            rightEye: <path d="M 58 42 Q 62 39 66 42" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
            mouth: <path d="M 40 57 Q 50 64 60 57" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round" />,
            brows: null
        },
        confident: {
            leftEye: <ellipse cx="38" cy="42" rx="3" ry="3.5" fill="#1a1a2e" />,
            rightEye: (
                <>
                    <line x1="58" y1="42" x2="66" y2="42" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
                </>
            ),
            mouth: <path d="M 40 56 Q 50 65 60 56" stroke="#1a1a2e" strokeWidth="2.2" fill="none" strokeLinecap="round" />,
            brows: null
        }
    };

    const expr = expressions[reaction] || expressions.idle;

    return (
        <svg viewBox="0 0 100 100" className="character-avatar-svg" aria-label={`${character.name} avatar`}>
            {/* Shoulders / body */}
            <ellipse cx="50" cy="95" rx="35" ry="18" fill={shirtColor} />

            {/* Neck */}
            <rect x="44" y="72" width="12" height="10" rx="3" fill={skinColor} />

            {/* Head */}
            <ellipse cx="50" cy="48" rx="25" ry="28" fill={skinColor} />

            {/* Hair base */}
            <ellipse cx="50" cy="30" rx="26" ry="16" fill={hairColor} />
            {ageGroup === 'young' && (
                <path d="M 24 40 Q 24 20 50 18 Q 76 20 76 40" fill={hairColor} />
            )}
            {ageGroup === 'adult' && (
                <path d="M 26 42 Q 24 22 50 20 Q 76 22 74 42" fill={hairColor} />
            )}
            {ageGroup === 'senior' && (
                <>
                    <path d="M 24 45 Q 22 20 50 18 Q 78 20 76 45" fill={hairColor} />
                    <path d="M 26 45 Q 20 50 22 55" stroke={hairColor} strokeWidth="3" fill="none" />
                    <path d="M 74 45 Q 80 50 78 55" stroke={hairColor} strokeWidth="3" fill="none" />
                </>
            )}

            {/* Ears */}
            <ellipse cx="25" cy="48" rx="4" ry="6" fill={skinColor} />
            <ellipse cx="75" cy="48" rx="4" ry="6" fill={skinColor} />

            {/* Eyes */}
            {expr.leftEye}
            {expr.rightEye}
            {/* Eye shine */}
            {reaction !== 'relief' && (
                <>
                    <circle cx="36.5" cy="40.5" r="1.2" fill="white" opacity="0.8" />
                    <circle cx="60.5" cy="40.5" r="1.2" fill="white" opacity="0.8" />
                </>
            )}

            {/* Brows */}
            {expr.brows}

            {/* Mouth */}
            {expr.mouth}

            {/* Blush for relief/confident */}
            {(reaction === 'relief' || reaction === 'confident') && (
                <>
                    <circle cx="33" cy="52" r="4" fill="#ff9999" opacity="0.2" />
                    <circle cx="67" cy="52" r="4" fill="#ff9999" opacity="0.2" />
                </>
            )}

            {/* Accessories */}
            {accessory === 'glasses' && (
                <>
                    <circle cx="38" cy="42" r="8" fill="none" stroke="#4a4a6a" strokeWidth="1.8" />
                    <circle cx="62" cy="42" r="8" fill="none" stroke="#4a4a6a" strokeWidth="1.8" />
                    <line x1="46" y1="42" x2="54" y2="42" stroke="#4a4a6a" strokeWidth="1.5" />
                    <line x1="30" y1="42" x2="25" y2="40" stroke="#4a4a6a" strokeWidth="1.5" />
                    <line x1="70" y1="42" x2="75" y2="40" stroke="#4a4a6a" strokeWidth="1.5" />
                </>
            )}
            {accessory === 'tie' && (
                <polygon points="50,82 47,92 50,97 53,92" fill="#e74c3c" />
            )}
            {accessory === 'headphones' && (
                <>
                    <path d="M 24 42 Q 22 25 50 22 Q 78 25 76 42" stroke="#333" strokeWidth="3" fill="none" />
                    <rect x="20" y="38" width="6" height="10" rx="2" fill="#333" />
                    <rect x="74" y="38" width="6" height="10" rx="2" fill="#333" />
                </>
            )}
            {accessory === 'badge' && (
                <rect x="36" y="84" width="10" height="6" rx="1" fill="white" opacity="0.7" />
            )}
            {accessory === 'earbuds' && (
                <>
                    <circle cx="25" cy="50" r="2.5" fill="#ddd" />
                    <line x1="25" y1="52" x2="30" y2="62" stroke="#ddd" strokeWidth="1" />
                </>
            )}
        </svg>
    );
}

/* Device icon mapping */
const DeviceIcon = ({ type }) => {
    switch (type) {
        case 'phone': return <Smartphone size={12} />;
        case 'desktop': return <Monitor size={12} />;
        case 'laptop': return <Laptop size={12} />;
        default: return <Laptop size={12} />;
    }
};

/* Emotion labels */
const emotionLabels = {
    idle: '😐 Observing',
    thinking: '🤔 Thinking',
    confused: '😕 Confused',
    panic: '😰 Panicked',
    relief: '😌 Relieved',
    confident: '😎 Confident'
};

export default function Character({ character, reaction = 'idle' }) {
    const [displayedDialogue, setDisplayedDialogue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const dialogue = character.dialogues[reaction] || character.dialogues.idle;

    // Typewriter effect for dialogue changes
    useEffect(() => {
        setIsTyping(true);
        setDisplayedDialogue('');
        let index = 0;
        const interval = setInterval(() => {
            if (index < dialogue.length) {
                setDisplayedDialogue(dialogue.slice(0, index + 1));
                index++;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, 22);
        return () => clearInterval(interval);
    }, [dialogue]);

    return (
        <div className={`character-panel reaction-${reaction}`} key={reaction}>
            <div className="character-avatar-section">
                <div className="character-avatar-wrapper">
                    <div className="character-avatar-bg" />
                    <CharacterAvatar character={character} reaction={reaction} />
                </div>
                <div className="character-name">{character.name}</div>
                <div className="character-role">{character.role}</div>
                <div className="character-device-icon">
                    <DeviceIcon type={character.device} />
                    <span>{character.device === 'phone' ? 'Phone' : character.device === 'desktop' ? 'PC' : 'Laptop'}</span>
                </div>
            </div>

            <div className="character-dialogue">
                <div className="dialogue-bubble" key={dialogue}>
                    &quot;{displayedDialogue}{isTyping && <span className="cursor-blink">|</span>}&quot;
                </div>
                <div className={`emotion-indicator ${reaction}`}>
                    {emotionLabels[reaction]}
                </div>
            </div>
        </div>
    );
}
