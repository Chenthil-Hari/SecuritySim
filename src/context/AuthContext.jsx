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
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const adminLogin = async (email, password) => {
        try {
            const response = await fetch(buildApiUrl('/api/auth/admin-login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
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
        <AuthContext.Provider value={{ user, loading, login, adminLogin, signup, logout, updateUser, checkFreezeStatus }}>
            {loading ? <Loader /> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
