import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for dummy session
        const storedUser = localStorage.getItem('securitysim_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // In a real app, you would validate credentials here
        const loggedInUser = { id: 1, email, name: email.split('@')[0] };
        setUser(loggedInUser);
        localStorage.setItem('securitysim_user', JSON.stringify(loggedInUser));
        return true;
    };

    const signup = (email, password) => {
        // In a real app, you would register the user here
        const newUser = { id: Date.now(), email, name: email.split('@')[0] };
        setUser(newUser);
        localStorage.setItem('securitysim_user', JSON.stringify(newUser));
        return true;
    };

    const loginWithGoogle = () => {
        // In a real app, you would use Firebase Auth or OAuth here
        const googleUser = { id: Date.now(), email: 'google.user@gmail.com', name: 'Google User', provider: 'google' };
        setUser(googleUser);
        localStorage.setItem('securitysim_user', JSON.stringify(googleUser));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('securitysim_user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
