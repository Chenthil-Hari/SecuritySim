import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import './AdminLogin.css';

export default function AdminLogin() {
    const navigate = useNavigate();

    return (
        <div className="admin-login-page">
            <button className="back-btn" onClick={() => navigate('/')} style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowLeft size={18} /> Back to Site
            </button>
            
            <div className="admin-login-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div className="admin-logo" style={{ textAlign: 'center' }}>
                    <div className="shield-icon" style={{ margin: '0 auto 1rem' }}>
                        <Shield size={60} color="#00f0ff" />
                        <Lock size={24} className="lock-overlay" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#0d1117' }} />
                    </div>
                    <h1 style={{ fontSize: '2rem', color: '#e6edf3' }}>SecuritySim<span style={{ color: '#00f0ff' }}>Admin</span></h1>
                    <p style={{ color: '#8b949e', marginTop: '0.5rem' }}>Authorized Personnel Only</p>
                </div>

                <SignIn 
                    routing="path" 
                    path="/admin" 
                    forceRedirectUrl="/admin/dashboard"
                    appearance={{
                        elements: {
                            rootBox: "clerk-theme-dark",
                            card: { backgroundColor: '#0d1117', border: '1px solid #30363d' },
                            headerTitle: { color: '#e6edf3' },
                            headerSubtitle: { color: '#8b949e' },
                            socialButtonsBlockButton: { color: '#e6edf3', border: '1px solid #30363d' },
                            socialButtonsBlockButtonText: { color: '#e6edf3' },
                            dividerLine: { background: '#30363d' },
                            dividerText: { color: '#8b949e' },
                            formFieldLabel: { color: '#c9d1d9' },
                            formFieldInput: { backgroundColor: '#161b22', border: '1px solid #30363d', color: '#fff' },
                            formButtonPrimary: { backgroundColor: '#00f0ff', color: '#0d1117' },
                            footerActionText: { color: '#8b949e' },
                            footerActionLink: { color: '#00f0ff' }
                        }
                    }}
                />
            </div>
        </div>
    );
}
