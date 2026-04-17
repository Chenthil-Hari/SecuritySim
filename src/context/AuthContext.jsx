import { createContext, useState, useContext, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { buildApiUrl } from '../utils/api';
import Loader from '../components/Loader';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { isLoaded: isClerkLoaded, isSignedIn, user: clerkUser } = useUser();
    const { getToken } = useClerkAuth();
    const { signOut } = useClerk();
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const syncWithBackend = async () => {
            if (!isClerkLoaded) return;
            
            if (isSignedIn && clerkUser) {
                try {
                    const token = await getToken();
                    // Sync the Clerk user with our MongoDB backend
                    const response = await fetch(buildApiUrl('/api/auth/sync'), {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            clerkId: clerkUser.id,
                            email: clerkUser.primaryEmailAddress?.emailAddress,
                            username: clerkUser.username || clerkUser.primaryEmailAddress?.emailAddress.split('@')[0],
                            profilePhoto: clerkUser.imageUrl
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        // Standardize ID field for backwards compatibility
                        const mongoUser = data.user;
                        if (mongoUser._id && !mongoUser.id) mongoUser.id = mongoUser._id;
                        
                        setUser(mongoUser);
                        localStorage.setItem('token', token); // Store token for other API calls to use
                        console.log("[Auth] Successfully synced with MongoDB profile.");
                    } else {
                        const errorData = await response.json().catch(() => ({}));
                        console.error("Failed to sync user with backend:", errorData.message || response.statusText);
                        setUser(null);
                    }
                } catch (err) {
                    console.error("Error during Clerk -> MongoDB sync", err);
                    setUser(null);
                }
            } else {
                setUser(null);
                localStorage.removeItem('token');
            }
            setLoading(false);
        };

        syncWithBackend();
    }, [isClerkLoaded, isSignedIn, clerkUser, getToken]);

    // Stub for backwards compatibility. Clerk handles login/signup now.
    const login = async () => { return { success: false, error: 'Use Clerk Sign In' }; };
    const signup = async () => { return { success: false, error: 'Use Clerk Sign Up' }; };
    const adminLogin = async () => { return { success: false, error: 'Use Clerk Sign In' }; };

    const checkFreezeStatus = async () => {
        if (!user || !isSignedIn) return;
        try {
            const token = await getToken();
            const response = await fetch(buildApiUrl('/api/users/status'), {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 403) {
                setUser(prev => ({ ...prev, isFrozen: true }));
                return;
            }

            if (response.ok) {
                const data = await response.json();
                if (data.isFrozen !== user.isFrozen) {
                    setUser(prev => ({ ...prev, isFrozen: data.isFrozen }));
                }
            }
        } catch (error) {
            console.error("Error checking freeze status", error);
        }
    };

    const logout = async () => {
        await signOut();
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading: !isClerkLoaded || loading, 
            isLoggedIn: !!user, 
            login, 
            adminLogin, 
            signup, 
            logout,
            checkFreezeStatus,
            register: signup // Alias for compatibility
        }}>
            {!isClerkLoaded ? <Loader /> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
