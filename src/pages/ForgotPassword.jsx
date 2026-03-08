import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft, Send } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import './Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch(buildApiUrl('/api/auth/forgot-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage(data.message);
            } else {
                setError(data.message || 'Failed to initiate recovery');
            }
        } catch (err) {
            setError('System communication failure');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <button className="back-btn auth-back-btn" onClick={() => navigate('/login')}>
                <ArrowLeft size={18} /> Back to Login
            </button>
            <div className="auth-card">
                <div className="auth-header">
                    <Shield className="auth-logo" size={48} />
                    <h2>Password Recovery</h2>
                    <p>Enter your email to receive recovery instructions</p>
                </div>

                {message && <div className="auth-error success-alert" style={{ background: 'rgba(63, 185, 80, 0.1)', color: '#3fb950', border: '1px solid rgba(63, 185, 80, 0.2)' }}>{message}</div>}
                {error && <div className="auth-error">{error}</div>}

                {!message && (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Agent Email</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={20} />
                                <input 
                                    id="email" 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="Enter registered email" 
                                    required 
                                />
                            </div>
                        </div>
                        <button type="submit" className="auth-submit" disabled={isLoading}>
                            {isLoading ? <div className="spinner"></div> : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                    <Send size={18} /> Deploy Recovery Link
                                </span>
                            )}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p>Rethinked? <Link to="/login">Back to Base</Link></p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
