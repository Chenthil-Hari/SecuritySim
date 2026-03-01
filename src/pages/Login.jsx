import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User, UserPlus, AlertCircle } from 'lucide-react';
import './Login.css';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

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

        try {
            if (isLogin) {
                await login(email, password);
                navigate('/dashboard');
            } else {
                await signup(email, password);
                navigate('/verify-email');
            }
        } catch (err) {
            console.error("Auth Exception:", err);
            if (isLogin && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.message.includes('invalid-credential') || err.message.includes('user-not-found'))) {
                setShowSignupModal(true);
            } else if (!isLogin && (err.code === 'auth/email-already-in-use' || err.message.includes('email-already-in-use'))) {
                setError('An account with this email already exists. Please log in instead.');
            } else {
                setError('Authentication failed. Please check your credentials and try again.');
            }
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Google login failed.');
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
                            ? 'Enter your credentials to access your training'
                            : 'Sign up to start your cybersecurity journey'}
                    </p>
                </div>

                {error && <div className="login-error">{error}</div>}

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

                    <button type="submit" className="btn-primary login-btn">
                        {isLogin ? (
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

                <div className="login-divider">
                    <span>OR</span>
                </div>

                <button
                    type="button"
                    className="btn-outline google-btn"
                    onClick={handleGoogleLogin}
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Continue with Google
                </button>

                <div className="login-toggle">
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            className="toggle-btn"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>

            {/* Signup Modal Popup */}
            {showSignupModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-icon">
                            <AlertCircle size={48} />
                        </div>
                        <h3>Account Not Found</h3>
                        <p>We couldn't find an account matching <strong>{email}</strong>.</p>
                        <p>Would you like to quickly create a new account using the password you just entered?</p>

                        <div className="modal-actions">
                            <button
                                className="btn-outline"
                                onClick={() => setShowSignupModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={async () => {
                                    try {
                                        await signup(email, password);
                                        navigate('/verify-email');
                                    } catch (err) {
                                        setShowSignupModal(false);
                                        if (err.code === 'auth/email-already-in-use' || err.message.includes('email-already-in-use')) {
                                            setError('An account with this email already exists. Please log in instead.');
                                            setIsLogin(true);
                                        } else {
                                            setError('Signup failed. Please try again.');
                                        }
                                    }
                                }}
                            >
                                <UserPlus size={18} style={{ marginRight: '8px' }} />
                                Yes, Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
