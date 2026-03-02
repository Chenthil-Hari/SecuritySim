// In production (Vercel), API routes are at /api/* on the same domain
// In development, the Express server runs on localhost:5000
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isDev ? 'http://localhost:5000/api' : '/api';

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

    // Handle non-JSON responses (e.g., Vercel error pages)
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        const text = await response.text();
        if (!response.ok) {
            throw new Error(`Server error (${response.status}). Please try again.`);
        }
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error(`Server returned unexpected response. Please try again.`);
        }
    }

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
