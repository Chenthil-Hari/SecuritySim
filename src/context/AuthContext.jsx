import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setToken, removeToken, getToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check if we have a saved token and load user
    useEffect(() => {
        const token = getToken();
        if (token) {
            authAPI.getMe()
                .then(({ user: userData }) => {
                    setUser(userData);
                })
                .catch(() => {
                    // Token is invalid/expired
                    removeToken();
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const { token, user: userData } = await authAPI.login(email, password);
        setToken(token);
        setUser(userData);
        return userData;
    };

    const signup = async (email, password) => {
        const { token, user: userData } = await authAPI.register(email, password);
        setToken(token);
        setUser(userData);
        return userData;
    };

    const loginWithGoogle = async (credential) => {
        const { token, user: userData } = await authAPI.googleLogin(credential);
        setToken(token);
        setUser(userData);
        return userData;
    };

    const updateUserProfile = async (profileData) => {
        const { user: updatedUser } = await authAPI.updateProfile(profileData);
        setUser(updatedUser);
    };

    const logout = () => {
        removeToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, updateUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
