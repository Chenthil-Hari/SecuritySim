// Define the base URL. If we are running in production on Vercel, Vite will inject the actual URL.
// If it's not defined, we fallback to a relative path which works for the Vite local proxy.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Helper function to safely construct API endpoints.
 * @param {string} endpoint - The endpoint path starting with a slash, e.g., `/api/auth/login`
 * @returns {string} The fully constructed URL.
 */
export const buildApiUrl = (endpoint) => {
    // Ensure the endpoint starts with a slash
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // If API_BASE_URL is empty, it returns the relative path
    return `${API_BASE_URL}${path}`;
};
