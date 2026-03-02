import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User, UserPlus } from 'lucide-react';
import './Login.css';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const googleBtnRef = useRef(null);

    // Initialize Google Sign-In
    useEffect(() => {
        const initGoogle = () => {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: handleGoogleCallback
                });
                window.google.accounts.id.renderButton(googleBtnRef.current, {
                    theme: 'outline',
                    size: 'large',
                    width: '100%',
                    text: 'continue_with'
                });
            }
        };

        // Load the Google Identity Services script if not already loaded
        if (!window.google?.accounts?.id) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initGoogle;
            document.head.appendChild(script);
        } else {
            initGoogle();
        }
    }, []);

    const handleGoogleCallback = async (response) => {
        setIsLoading(true);
        setError('');
        try {
            await loginWithGoogle(response.credential);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Google login failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">
                        <Shield size={32} />
                    </div>
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>
                        {isLogin
                            ? 'Sign in to access your training'
                            : 'Sign up to start your cybersecurity journey'}
                    </p>
                </div>

                {error && <div className="login-error">{error}</div>}

                {/* Google Sign-In Button */}
                <div ref={googleBtnRef} className="google-btn-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}></div>

                <div className="login-divider">
                    <span>OR</span>
                </div>

                {/* Email/Password Form */}
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-with-icon">
                            <Mail size={18} />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} />
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary login-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Please wait...' : isLogin ? (
                            <>
                                <User size={18} /> Login
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} /> Sign Up
                            </>
                        )}
                    </button>
                </form>

                <div className="login-toggle">
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            className="toggle-btn"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
