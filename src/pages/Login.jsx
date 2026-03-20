import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Mail as MailIcon, Lock, ArrowLeft, User, Globe, MessageSquare } from 'lucide-react';
import './Login.css';

const localFadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: { type: 'spring', bounce: 0.4, duration: 0.8 } 
    }
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [banReason, setBanReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 1.0;
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Failed to login');
            setBanReason(result.reason || '');
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
            <motion.div 
                className="auth-card"
                initial="hidden"
                animate="show"
                variants={localFadeUp}
            >
                <div className="auth-header">
                    <Shield className="auth-logo" size={48} />
                    <h2>Welcome Back</h2>
                    <p>Sign in to continue your secure journey</p>
                </div>
                {error && (
                    <div className={`auth-error ${banReason ? 'suspension-alert' : ''}`}>
                        <div className="error-message">{error}</div>
                        {banReason && (
                            <div className="suspension-reason">
                                <strong>Reason:</strong> {banReason}
                            </div>
                        )}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="auth-form">
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
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                        </div>
                    </div>
                    <div className="forgot-password-link">
                        <Link to="/forgot-password">Forgot Access Credentials?</Link>
                    </div>
                    <button type="submit" className="auth-submit" disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : 'Initialize Login Sequence'}
                    </button>
                </form>
                <div className="auth-footer">
                    <p>Don't have clearance? <Link to="/signup">Request Access</Link></p>
                </div>
            </motion.div>
            <div className="auth-bg-decorators">
                <div className="decorator-blob blob-1"></div>
                <div className="decorator-blob blob-2"></div>
            </div>
        </div>
    );
};

export default Login;
