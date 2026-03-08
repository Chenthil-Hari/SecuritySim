import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import './Login.css';

const VerifyEmail = () => {
    const { user, updateUser } = useAuth();
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // If user is already verified or not logged in, redirect
    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.isVerified) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Validation Error: OTP must be 6 digits.');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch(buildApiUrl('/api/auth/verify-email'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, otp })
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage(data.message);
                updateUser({ isVerified: true });
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                setError(data.message || 'Verification failed');
            }
        } catch (err) {
            setError('System communication failure');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        setMessage('');
        try {
            const res = await fetch(buildApiUrl('/api/auth/resend-otp'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user?.email })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('New verification code deployed to ' + user?.email);
            } else {
                setError(data.message || 'Failed to resend code');
            }
        } catch (err) {
            setError('Resend protocol failed');
        } finally {
            setResending(false);
        }
    };

    if (!user) return null;

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <Shield className="auth-logo" size={48} />
                    <h2>Email Verification</h2>
                    <p>Enter the 6-digit code sent to <strong>{user.email}</strong></p>
                </div>

                {message && (
                    <div className="auth-error success-alert" style={{ background: 'rgba(63, 185, 80, 0.1)', color: '#3fb950', border: '1px solid rgba(63, 185, 80, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={18} /> {message}
                    </div>
                )}
                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="otp">Verification Code (OTP)</label>
                        <div className="input-wrapper">
                            <Key className="input-icon" size={20} />
                            <input 
                                id="otp" 
                                type="text" 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                                placeholder="000000" 
                                required 
                                style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.5rem' }}
                            />
                        </div>
                    </div>
                    <button type="submit" className="auth-submit" disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : 'Confirm Identity'}
                    </button>
                </form>

                <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
                    <p>Didn't receive the intel? 
                        <button 
                            onClick={handleResend} 
                            disabled={resending}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '5px' }}
                        >
                            {resending ? <RefreshCw className="spin" size={14} /> : 'Resend Code'}
                        </button>
                    </p>
                    <p style={{ marginTop: '1rem' }}><Link to="/login" onClick={() => localStorage.clear()}>Cancel & Logout</Link></p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
