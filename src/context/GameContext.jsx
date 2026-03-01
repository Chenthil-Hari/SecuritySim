import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
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
    },
    _loaded: false
};

function loadLocalState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return { ...defaultState, ...JSON.parse(saved), _loaded: true };
        }
    } catch (e) {
        console.warn('Failed to load saved state', e);
    }
    return { ...defaultState, _loaded: true };
}

function saveLocalState(state) {
    try {
        const { _loaded, ...stateToSave } = state;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
        console.warn('Failed to save local state', e);
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
        case 'LOAD_FROM_CLOUD': {
            newState = { ...defaultState, ...action.payload, _loaded: true };
            break;
        }
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
            newState = { ...defaultState, settings: state.settings, _loaded: true };
            break;
        }
        default:
            return state;
    }

    saveLocalState(newState);
    return newState;
}

// Save game state to Firestore
async function saveToCloud(uid, state) {
    try {
        const { _loaded, settings, ...gameData } = state;
        await setDoc(doc(db, 'users', uid), {
            gameState: gameData,
            settings: settings,
            updatedAt: Date.now()
        }, { merge: true });

        // Also update leaderboard entry
        const user = (await import('../firebase')).auth.currentUser;
        const displayName = user?.displayName || user?.email?.split('@')[0] || 'Anonymous';
        await setDoc(doc(db, 'leaderboard', uid), {
            displayName: displayName,
            photoURL: user?.photoURL || null,
            score: state.score,
            level: state.level,
            xp: state.xp,
            scenariosCompleted: state.completedScenarios.length,
            badgesCount: state.badges.length,
            updatedAt: Date.now()
        }, { merge: true });
    } catch (err) {
        console.warn('Failed to save to cloud:', err);
    }
}

// Load game state from Firestore
async function loadFromCloud(uid) {
    try {
        const docSnap = await getDoc(doc(db, 'users', uid));
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.gameState) {
                return {
                    ...defaultState,
                    ...data.gameState,
                    settings: data.settings || defaultState.settings
                };
            }
        }
    } catch (err) {
        console.warn('Failed to load from cloud:', err);
    }
    return null;
}

export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, defaultState);
    const { user } = useAuth();
    const prevScoreRef = useRef(null);
    const hasLoadedRef = useRef(false);

    // Load state from Firestore when user logs in
    useEffect(() => {
        if (user && !hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadFromCloud(user.uid).then((cloudState) => {
                if (cloudState) {
                    dispatch({ type: 'LOAD_FROM_CLOUD', payload: cloudState });
                    saveLocalState({ ...cloudState, _loaded: true });
                } else {
                    // No cloud data — load from localStorage and push to cloud
                    const localState = loadLocalState();
                    dispatch({ type: 'LOAD_FROM_CLOUD', payload: localState });
                    saveToCloud(user.uid, localState);
                }
            });
        }

        // Reset when user logs out
        if (!user) {
            hasLoadedRef.current = false;
        }
    }, [user]);

    // Save to Firestore whenever game state changes (after initial load)
    useEffect(() => {
        if (!user || !state._loaded) return;

        // Only save if something actually changed
        const currentKey = `${state.score}-${state.xp}-${state.level}-${state.badges.length}-${state.completedScenarios.length}`;
        if (prevScoreRef.current === currentKey) return;
        prevScoreRef.current = currentKey;

        saveToCloud(user.uid, state);
    }, [user, state]);

    // Apply high contrast setting
    useEffect(() => {
        if (state.settings.highContrast) {
            document.documentElement.setAttribute('data-theme', 'high-contrast');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [state.settings.highContrast]);

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
