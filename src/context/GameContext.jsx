import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { buildApiUrl } from '../utils/api';
import titles from '../data/titles';
import MatrixBackground from '../components/MatrixBackground';

const GameContext = createContext(null);
const GameDispatchContext = createContext(null);

const STORAGE_KEY = 'securitysim_state';

const defaultState = {
    score: 50,
    xp: 0,
    level: 1,
    skillPoints: 0,
    unlockedSkills: [],
    weeklyCompleted: [],
    badges: [],
    unlockedTitles: [],
    difficulty: 1,
    settings: {
        highContrast: false,
        voiceGuidance: false,
        soundEffects: true
    },
    customization: {
        activeBanner: 'default',
        matrixEnabled: false,
        auraEnabled: true
    }
};

function loadLocalState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return { ...defaultState, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.warn('Failed to load saved state', e);
    }
    return { ...defaultState };
}

function saveLocalState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save local state', e);
    }
}

// Sync game state to MongoDB (fire-and-forget)
function syncToDatabase(state) {
    try {
        const token = localStorage.getItem('token');
        if (!token) return; // Not logged in, skip sync

        fetch(buildApiUrl('/api/profile/sync'), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                score: state.score,
                xp: state.xp,
                level: state.level,
                skillPoints: state.skillPoints,
                unlockedSkills: state.unlockedSkills,
                weeklyCompleted: state.weeklyCompleted,
                badges: state.badges,
                unlockedTitles: state.unlockedTitles,
                customization: state.customization
            })
        }).catch(err => console.warn('Background sync failed:', err));
    } catch (e) {
        console.warn('Failed to sync to database', e);
    }
}

function calculateLevel(xp) {
    return Math.floor(xp / 100) + 1;
}

function calculateScore(badges) {
    // Base score (50) + Badge bonus (100 pts per badge)
    return Math.round(50 + (badges.length * 100));
}

function calculateDifficulty(score, level) {
    if (score >= 80 && level >= 3) return 3;
    if (score >= 60 && level >= 2) return 2;
    return 1;
}

function gameReducer(state, action) {
    let newState;

    const checkNewTitles = (currState) => {
        const newlyUnlocked = titles
            .filter(t => !currState.unlockedTitles.includes(t.name) && t.condition(currState))
            .map(t => t.name);

        if (newlyUnlocked.length > 0) {
            return {
                ...currState,
                unlockedTitles: [...currState.unlockedTitles, ...newlyUnlocked]
            };
        }
        return currState;
    };

    switch (action.type) {

        case 'EARN_BADGE': {
            if (state.badges.includes(action.payload)) return state;
            const newBadges = [...state.badges, action.payload];
            const newScore = calculateScore(newBadges);
            const newDifficulty = calculateDifficulty(newScore, state.level);

            newState = {
                ...state,
                badges: newBadges,
                score: newScore,
                difficulty: newDifficulty
            };
            newState = checkNewTitles(newState);
            break;
        }
        case 'UPDATE_SETTINGS': {
            newState = {
                ...state,
                settings: { ...state.settings, ...action.payload }
            };
            break;
        }
        case 'RESET_PROGRESS': {
            newState = { ...defaultState, settings: state.settings };
            break;
        }
        case 'HYDRATE_STATE': {
            newState = {
                ...state,
                score: action.payload.score,
                xp: action.payload.xp,
                level: action.payload.level,
                skillPoints: action.payload.skillPoints !== undefined ? action.payload.skillPoints : state.skillPoints,
                unlockedSkills: action.payload.unlockedSkills || state.unlockedSkills,
                weeklyCompleted: action.payload.weeklyCompleted || state.weeklyCompleted,
                badges: action.payload.badges,
                unlockedTitles: action.payload.unlockedTitles || state.unlockedTitles || [],
                seasonalMedals: action.payload.seasonalMedals || state.seasonalMedals || [],
                customization: { ...state.customization, ...(action.payload.customization || {}) },
                campaignState: action.payload.campaignState || state.campaignState
            };
            break;
        }
        case 'SPEND_SKILL_POINT': {
            const skillId = action.payload;
            if (state.skillPoints > 0 && !state.unlockedSkills.includes(skillId)) {
                newState = {
                    ...state,
                    skillPoints: state.skillPoints - 1,
                    unlockedSkills: [...state.unlockedSkills, skillId]
                };
            } else {
                return state;
            }
            break;
        }
        case 'COMPLETE_WEEKLY': {
            const { weekId, xpEarned, category } = action.payload;
            if (state.weeklyCompleted.includes(weekId)) return state;

            const newXp = state.xp + xpEarned;
            const newLevel = calculateLevel(newXp);
            const newSkillPoints = state.skillPoints + (newLevel > state.level ? newLevel - state.level : 0);

            newState = {
                ...state,
                xp: newXp,
                level: newLevel,
                skillPoints: newSkillPoints,
                weeklyCompleted: [...state.weeklyCompleted, weekId]
            };
            break;
        }
        case 'UPDATE_CUSTOMIZATION': {
            newState = {
                ...state,
                customization: { ...state.customization, ...action.payload }
            };
            break;
        }
        default:
            return state;
    }

    saveLocalState(newState);
    // Sync to MongoDB after each game action (except reading settings or hydrating)
    if (action.type !== 'UPDATE_SETTINGS' && action.type !== 'HYDRATE_STATE') {
        syncToDatabase(newState);
    }
    return newState;
}

export function GameProvider({ children }) {
    const { user } = useAuth();
    const [state, dispatch] = useReducer(gameReducer, null, loadLocalState);

    // Apply high contrast setting
    useEffect(() => {
        if (state.settings.highContrast) {
            document.documentElement.setAttribute('data-theme', 'high-contrast');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [state.settings.highContrast]);

    // Hydrate state from DB when user logs in
    useEffect(() => {
        if (user) {
            const token = localStorage.getItem('token');
            if (token) {
                fetch(buildApiUrl('/api/profile/me'), {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data && data._id) {
                            dispatch({
                                type: 'HYDRATE_STATE',
                                payload: {
                                    score: data.score ?? 50,
                                    xp: data.xp ?? 0,
                                    level: data.level ?? 1,
                                    badges: data.badges ?? [],
                                    unlockedTitles: data.unlockedTitles ?? [],
                                    seasonalMedals: data.seasonalMedals ?? [],
                                    customization: data.customization ?? {}
                                }
                            });
                        }
                    })
                    .catch(err => console.error('Failed to hydrate state:', err));
            }
        }
    }, [user, dispatch]);

    return (
        <GameContext.Provider value={state}>
            <GameDispatchContext.Provider value={dispatch}>
                {state?.customization?.matrixEnabled && <MatrixBackground />}
                {children}
            </GameDispatchContext.Provider>
        </GameContext.Provider>
    );
}

export function useGame() {
    return useContext(GameContext);
}

export function useGameDispatch() {
    return useContext(GameDispatchContext);
}
