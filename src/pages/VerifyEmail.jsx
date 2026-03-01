import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle, RefreshCw, LogOut } from 'lucide-react';
import './VerifyEmail.css';

export default function VerifyEmail() {
    const { user, resendVerification, logout } = useAuth();
    const navigate = useNavigate();
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // If the user lands here but is already verified (e.g. Google Login or previously verified),
        // bounce them to the dashboard immediately.
        if (user && user.emailVerified) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleCheckVerification = async () => {
        if (!user) return;

        try {
            // Force Firebase to fetch the latest auth state from the server
            // rather than relying on its cached token.
            await user.reload();

            if (user.emailVerified) {
                navigate('/dashboard');
            } else {
                setError('Your email is still not verified. Please check your inbox.');
                setTimeout(() => setError(''), 4000);
            }
        } catch (err) {
            setError('Error checking verification status.');
        }
    };

    const handleResend = async () => {
        setSending(true);
        setError('');
        setMessage('');

        try {
            await resendVerification();
            setMessage('Verification email sent! Check your inbox (and spam folder).');
            setTimeout(() => setMessage(''), 5000);
        } catch (err) {
            if (err.code === 'auth/too-many-requests') {
                setError('Too many requests. Please wait a few minutes before trying again.');
            } else {
                setError('Failed to resend email. Please try again later.');
            }
        } finally {
            setSending(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // If there's no user at all, don't flash the UI before Redirect kicks in
    if (!user) return null;

    return (
        <div className="verify-page">
            <div className="verify-container">
                <div className="verify-icon">
                    <Mail size={48} />
                </div>

                <h2>Verify your email</h2>
                <div className="verify-content">
                    <p>
                        We've sent an email to <strong>{user.email}</strong> to verify your account.
                        Please click the link in that email to continue your cybersecurity training.
                    </p>
                </div>

                {error && <div className="verify-error">{error}</div>}
                {message && <div className="verify-success">{message}</div>}

                <div className="verify-actions">
                    <button
                        className="btn-primary"
                        onClick={handleCheckVerification}
                    >
                        <CheckCircle size={18} style={{ marginRight: '8px' }} />
                        I've Verified My Email
                    </button>

                    <button
                        className="btn-outline"
                        onClick={handleResend}
                        disabled={sending}
                    >
                        <RefreshCw
                            size={18}
                            style={{
                                marginRight: '8px',
                                animation: sending ? 'spin 1s linear infinite' : 'none'
                            }}
                        />
                        {sending ? 'Sending...' : 'Resend Email'}
                    </button>
                </div>

                <div className="verify-footer">
                    <button className="link-btn" onClick={handleLogout}>
                        <LogOut size={16} /> Use a different account
                    </button>
                </div>
            </div>
        </div>
    );
}
