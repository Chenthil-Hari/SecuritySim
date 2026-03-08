import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, Lock, ArrowLeft, Terminal } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import './Login.css';

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Credential mismatch: Passwords do not correlate.');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch(buildApiUrl('/api/auth/reset-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage(data.message);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.message || 'Reset protocol failed');
            }
        } catch (err) {
            setError('System communication failure');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <Shield className="auth-logo" size={48} />
                    <h2>Reset Credentials</h2>
                    <p>Enter your new secure access key</p>
                </div>

                {message && <div className="auth-error success-alert" style={{ background: 'rgba(63, 185, 80, 0.1)', color: '#3fb950', border: '1px solid rgba(63, 185, 80, 0.2)' }}>{message} - Redirecting to login...</div>}
                {error && <div className="auth-error">{error}</div>}

                {!message && (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={20} />
                                <input 
                                    id="password" 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="••••••••" 
                                    required 
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <div className="input-wrapper">
                                <Terminal className="input-icon" size={20} />
                                <input 
                                    id="confirmPassword" 
                                    type="password" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    placeholder="••••••••" 
                                    required 
                                />
                            </div>
                        </div>
                        <button type="submit" className="auth-submit" disabled={isLoading}>
                            {isLoading ? <div className="spinner"></div> : 'Update Access Key'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
