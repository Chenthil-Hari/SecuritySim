const API_BASE_URL = 'http://localhost:5000/api';

const TOKEN_KEY = 'securitysim_token';

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

// Generic fetch wrapper with JWT
async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
}

// Auth API
export const authAPI = {
    register: (email, password, displayName) =>
        apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, displayName })
        }),

    login: (email, password) =>
        apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),

    googleLogin: (credential) =>
        apiFetch('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ credential })
        }),

    getMe: () =>
        apiFetch('/auth/me'),

    updateProfile: (profileData) =>
        apiFetch('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        })
};

// Game API
export const gameAPI = {
    loadState: () =>
        apiFetch('/game/state'),

    saveState: (gameState, settings) =>
        apiFetch('/game/state', {
            method: 'PUT',
            body: JSON.stringify({ gameState, settings })
        })
};

// Leaderboard API
export const leaderboardAPI = {
    getAll: () =>
        apiFetch('/leaderboard'),

    upsert: (data) =>
        apiFetch('/leaderboard', {
            method: 'PUT',
            body: JSON.stringify(data)
        })
};
