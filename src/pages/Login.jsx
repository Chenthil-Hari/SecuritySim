import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Failed to login');
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <Shield className="auth-logo" size={48} />
                    <h2>Welcome Back</h2>
                    <p>Sign in to continue your secure journey</p>
                </div>
                {error && <div className="auth-error">{error}</div>}
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
                    <button type="submit" className="auth-submit" disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : 'Initialize Login Sequence'}
                    </button>
                </form>
                <div className="auth-footer">
                    <p>Don't have clearance? <Link to="/signup">Request Access</Link></p>
                </div>
            </div>
            <div className="auth-bg-decorators">
                <div className="decorator-blob blob-1"></div>
                <div className="decorator-blob blob-2"></div>
            </div>
        </div>
    );
};

export default Login;
