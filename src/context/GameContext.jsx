import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const GameContext = createContext(null);
const GameDispatchContext = createContext(null);

const STORAGE_KEY = 'securitysim_state';

const defaultState = {
    score: 50,
    xp: 0,
    level: 1,
    badges: [],
    completedScenarios: [],
    difficulty: 1,
    settings: {
        highContrast: false,
        voiceGuidance: false
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

        fetch('/api/profile/sync', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                score: state.score,
                xp: state.xp,
                level: state.level,
                badges: state.badges,
                completedScenarios: state.completedScenarios
            })
        }).catch(err => console.warn('Background sync failed:', err));
    } catch (e) {
        console.warn('Failed to sync to database', e);
    }
}

function calculateLevel(xp) {
    return Math.floor(xp / 100) + 1;
}

function calculateScore(completedScenarios, badges) {
    if (completedScenarios.length === 0) return 50 + (badges.length * 100);

    // Base score for completing scenarios + accuracy bonus
    const scenarioScore = completedScenarios.reduce((sum, s) => {
        const accuracyMultiplier = s.accuracy / 100;
        return sum + (100 * accuracyMultiplier); // Up to 100 pts per scenario
    }, 0);

    // Badge bonus (100 pts per badge)
    const badgeScore = badges.length * 100;

    return Math.round(50 + scenarioScore + badgeScore);
}

function calculateDifficulty(score, level) {
    if (score >= 80 && level >= 3) return 3;
    if (score >= 60 && level >= 2) return 2;
    return 1;
}

function gameReducer(state, action) {
    let newState;

    switch (action.type) {
        case 'COMPLETE_SCENARIO': {
            const { scenarioId, category, accuracy, xpEarned } = action.payload;
            const newXp = state.xp + xpEarned;
            const newLevel = calculateLevel(newXp);
            const newCompleted = [
                ...state.completedScenarios,
                { scenarioId, category, accuracy, timestamp: Date.now() }
            ];
            const newScore = calculateScore(newCompleted, state.badges);
            const newDifficulty = calculateDifficulty(newScore, newLevel);

            newState = {
                ...state,
                xp: newXp,
                level: newLevel,
                completedScenarios: newCompleted,
                score: newScore,
                difficulty: newDifficulty
            };
            break;
        }
        case 'EARN_BADGE': {
            if (state.badges.includes(action.payload)) return state;
            const newBadges = [...state.badges, action.payload];
            const newScore = calculateScore(state.completedScenarios, newBadges);
            const newDifficulty = calculateDifficulty(newScore, state.level);

            newState = {
                ...state,
                badges: newBadges,
                score: newScore,
                difficulty: newDifficulty
            };
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
                badges: action.payload.badges,
                completedScenarios: action.payload.completedScenarios
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
                fetch('/api/profile/me', {
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
                                    completedScenarios: data.completedScenarios ?? []
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
