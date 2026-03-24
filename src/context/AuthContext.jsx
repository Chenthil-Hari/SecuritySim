import { createContext, useState, useContext, useEffect } from 'react';
import { buildApiUrl } from '../utils/api';
import Loader from '../components/Loader';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            if (storedToken && storedUser) {
                const parsedUser = JSON.parse(storedUser);
                // Standardize ID field for backwards compatibility without logout
                if (parsedUser._id && !parsedUser.id) parsedUser.id = parsedUser._id;
                // Legacy users (pre-OTP) should be considered UNVERIFIED by default to enforce the new policy,
                // EXCEPT for admins who should always maintain access to the Command Center
                if (parsedUser.isVerified === undefined) {
                    parsedUser.isVerified = (parsedUser.role === 'admin');
                }
                setUser(parsedUser);
            }
        } catch (error) {
            console.error("Error loading user context", error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(buildApiUrl('/api/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error('Server returned an invalid response. This often happens if the Vercel backend crashed or environment variables are missing.');
            }
            
            const data = await response.json();
            if (!response.ok) {
                const err = new Error(data.message || 'Login failed');
                err.reason = data.reason;
                throw err;
            }
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message, reason: error.reason };
        }
    };

    const adminLogin = async (email, password) => {
        try {
            const response = await fetch(buildApiUrl('/api/auth/admin-login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error('Server returned an invalid response. Check backend logs or Vercel configuration.');
            }
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Administrative login failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const signup = async (username, email, password, country) => {
        try {
            const response = await fetch(buildApiUrl('/api/auth/signup'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, country }),
            });
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error('Server returned an invalid response. Please check backend logs or Vercel configuration.');
            }
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Signup failed');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const checkFreezeStatus = async () => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(buildApiUrl('/api/users/status'), {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 403) {
                // Backend rejected the token due to freeze
                const updatedUser = { ...user, isFrozen: true };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                return;
            }

            if (response.ok) {
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    console.error("Non-JSON response received for status check.");
                    return;
                }
                const data = await response.json();
                if (data.isFrozen !== user.isFrozen) {
                    const updatedUser = { ...user, isFrozen: data.isFrozen };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            }
        } catch (error) {
            console.error("Error checking freeze status", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        // Force refresh to clear any cached states
        window.location.href = '/login';
    };

    const updateUser = (newUserData) => {
        const updatedUser = { ...user, ...newUserData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, loading, isLoggedIn: !!user, login, adminLogin, signup, logout, updateUser, checkFreezeStatus }}>
            {loading ? <Loader /> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
