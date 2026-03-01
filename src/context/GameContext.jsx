import { createContext, useContext, useReducer, useEffect } from 'react';
import { ref, set } from 'firebase/database';
import { rtdb, auth } from '../firebase';

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

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return { ...defaultState, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.warn('Failed to load saved state', e);
    }
    return defaultState;
}

function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save state', e);
    }
}

function calculateLevel(xp) {
    return Math.floor(xp / 100) + 1;
}

function calculateScore(completedScenarios) {
    if (completedScenarios.length === 0) return 50;
    const totalAccuracy = completedScenarios.reduce((sum, s) => sum + s.accuracy, 0);
    const avg = totalAccuracy / completedScenarios.length;
    return Math.min(100, Math.round(avg));
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
            const newScore = calculateScore(newCompleted);
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
            newState = {
                ...state,
                badges: [...state.badges, action.payload]
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
        default:
            return state;
    }

    saveState(newState);
    return newState;
}

// Sync user score to Realtime Database leaderboard
async function syncLeaderboard(user, state) {
    if (!user) return;
    try {
        const displayName = user.displayName || user.email?.split('@')[0] || 'Anonymous';
        await set(ref(rtdb, 'leaderboard/' + user.uid), {
            displayName: displayName,
            photoURL: user.photoURL || null,
            score: state.score,
            level: state.level,
            xp: state.xp,
            scenariosCompleted: state.completedScenarios.length,
            badgesCount: state.badges.length,
            updatedAt: Date.now()
        });
    } catch (err) {
        console.warn('Failed to sync leaderboard:', err);
    }
}

export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, null, loadState);

    useEffect(() => {
        if (state.settings.highContrast) {
            document.documentElement.setAttribute('data-theme', 'high-contrast');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [state.settings.highContrast]);

    // Sync score to Firestore whenever it changes
    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            syncLeaderboard(user, state);
        }
    }, [state.score, state.level, state.xp, state.badges.length, state.completedScenarios.length]);

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
