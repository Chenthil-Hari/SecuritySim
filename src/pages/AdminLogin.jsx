import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, AlertOctagon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';

export default function AdminLogin() {
    const navigate = useNavigate();
    const { adminLogin } = useAuth();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await adminLogin(credentials.email, credentials.password);
        
        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.error || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-container animate-fade-in">
                <div className="admin-logo">
                    <div className="shield-icon">
                        <Shield size={40} />
                        <Lock size={18} className="lock-overlay" />
                    </div>
                    <h1>SecuritySim<span>Admin</span></h1>
                </div>

                <div className="admin-card">
                    <div className="card-header">
                        <h2>Authorized Personnel Only</h2>
                        <p>Accessing this terminal without permission is a violation of security protocols.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="admin-error">
                                <AlertOctagon size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="admin-input-group">
                            <label>Admin Email</label>
                            <input 
                                type="email" 
                                required
                                value={credentials.email}
                                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                                placeholder="name@securitysim.com"
                            />
                        </div>

                        <div className="admin-input-group">
                            <label>Secure Key</label>
                            <input 
                                type="password" 
                                required
                                value={credentials.password}
                                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                placeholder="••••••••••••"
                            />
                        </div>

                        <button type="submit" className="admin-submit-btn" disabled={loading}>
                            {loading ? 'Verifying...' : <>Initialize Admin Session <ArrowRight size={18} /></>}
                        </button>
                    </form>
                </div>

                <div className="admin-footer">
                    <button onClick={() => navigate('/')}>Return to Main Site</button>
                    <span>System v2.4.0-moderation</span>
                </div>
            </div>
        </div>
    );
}
