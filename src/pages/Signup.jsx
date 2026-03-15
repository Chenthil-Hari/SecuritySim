import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import './Login.css';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [country, setCountry] = useState('Global');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Availability states
    const [usernameStatus, setUsernameStatus] = useState({ loading: false, available: null, message: '' });

    const { signup } = useAuth();
    const navigate = useNavigate();
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.75;
        }
    }, []);

    const checkUsernameAvailability = useCallback(async (name) => {
        if (name.length < 3) {
            setUsernameStatus({ loading: false, available: null, message: '' });
            return;
        }

        setUsernameStatus(prev => ({ ...prev, loading: true }));
        try {
            const res = await fetch(buildApiUrl(`/api/auth/check-username?username=${encodeURIComponent(name)}`));
            const data = await res.json();
            setUsernameStatus({
                loading: false,
                available: data.available,
                message: data.message
            });
        } catch (err) {
            console.error("Failed to check username", err);
            setUsernameStatus({ loading: false, available: null, message: '' });
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (username) checkUsernameAvailability(username);
        }, 500);

        return () => clearTimeout(timer);
    }, [username, checkUsernameAvailability]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (usernameStatus.available === false) {
            setError('Please choose a different Agent Name');
            return;
        }

        setError('');
        setIsLoading(true);
        const result = await signup(username, email, password, country);
        if (result.success) {
            navigate('/verify-email');
        } else {
            setError(result.error || 'Failed to create account');
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <video ref={videoRef} autoPlay loop muted playsInline className="auth-video-bg">
                <source src="/background.mp4" type="video/mp4" />
            </video>
            <button className="back-btn auth-back-btn" onClick={() => navigate('/')}>
                <ArrowLeft size={18} /> Back to Home
            </button>
            <div className="auth-card">
                <div className="auth-header">
                    <Shield className="auth-logo" size={48} />
                    <h2>Join SecuritySim</h2>
                    <p>Create your agent profile</p>
                </div>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Agent Name</label>
                        <div className="input-wrapper">
                            <User className="input-icon" size={20} />
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Agent ID"
                                required
                                minLength={3}
                                maxLength={20}
                            />
                            {usernameStatus.loading && <div className="input-loader"></div>}
                            {usernameStatus.available === true && <CheckCircle2 size={18} className="status-icon success" />}
                            {usernameStatus.available === false && <XCircle size={18} className="status-icon error" />}
                        </div>
                        {usernameStatus.message && (
                            <p className={`status-message ${usernameStatus.available ? 'success' : 'error'}`}>
                                {usernameStatus.message}
                            </p>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Agent Email" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Minimum 6 characters</p>
                    </div>
                    <div className="form-group">
                        <label htmlFor="country">Region (Country)</label>
                        <select
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="input-wrapper"
                            style={{ width: '100%', padding: '0.875rem 1rem', background: 'rgba(10, 15, 20, 0.6)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-primary)' }}
                        >
                            <option value="Global">Global (Unspecified)</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                            <option value="India">India</option>
                            <option value="Germany">Germany</option>
                            <option value="France">France</option>
                            <option value="Japan">Japan</option>
                            <option value="South Korea">South Korea</option>
                            <option value="Brazil">Brazil</option>
                        </select>
                    </div>
                    <button type="submit" className="auth-submit" disabled={isLoading || usernameStatus.available === false}>
                        {isLoading ? <div className="spinner"></div> : 'Register Profile'}
                    </button>
                </form>
                <div className="auth-footer">
                    <p>Already have clearance? <Link to="/login">Sign In</Link></p>
                </div>
            </div >
            <div className="auth-bg-decorators">
                <div className="decorator-blob blob-1"></div>
                <div className="decorator-blob blob-2"></div>
            </div>
        </div >
    );
};

export default Signup;
