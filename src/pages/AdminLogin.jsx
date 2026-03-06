import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, AlertOctagon } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import './AdminLogin.css';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(buildApiUrl('/api/auth/admin-login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                // Force a reload or update context if necessary, but navigate is enough for basic role protection
                navigate('/admin/dashboard');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('System error connecting to secure terminal.');
        } finally {
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
