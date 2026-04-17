import { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../utils/api';
import './Contact.css';

export default function Contact() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ subject: 'General Inquiry', message: '' });
    const [status, setStatus] = useState({ loading: false, success: false, error: null });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, error: null });

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/users/contact'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                setStatus({ loading: false, success: true, error: null });
                setFormData({ subject: 'General Inquiry', message: '' });
            } else {
                throw new Error(data.message || 'Failed to send message');
            }
        } catch (error) {
            setStatus({ loading: false, success: false, error: error.message });
        }
    };

    return (
        <div className="contact-page animate-fade-in">
            <div className="page-top-nav">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>
            </div>
            <div className="contact-header">
                <h1>Contact HQ Support</h1>
                <p>Have an issue, feedback, or a partnership inquiry? Transmit a secure message directly to Headquarters.</p>
            </div>

            <div className="contact-container single-panel">
                <div className="contact-info-panel centered-panel">
                    <div className="info-blob blob-1"></div>
                    <div className="info-blob blob-2"></div>

                    <div className="info-content">
                        {status.success ? (
                            <div className="success-state" style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <CheckCircle size={48} style={{ color: '#00ff88', margin: '0 auto 1rem' }} />
                                <h2>Message Transmitted</h2>
                                <p style={{ color: '#8b949e' }}>HQ has received your transmission. We will reply to your registered email address shortly.</p>
                                <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: '1.5rem' }}>Return to Base</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="support-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 2 }}>
                                {status.error && (
                                    <div className="error-message" style={{ background: 'rgba(255, 71, 87, 0.1)', color: '#ff4757', padding: '0.8rem', borderRadius: '4px', border: '1px solid rgba(255, 71, 87, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <AlertCircle size={16} /> {status.error}
                                    </div>
                                )}
                                <div className="form-group" style={{ textAlign: 'left' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c9d1d9', fontSize: '0.9rem' }}>Subject Category</label>
                                    <select 
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', background: '#0d1117', border: '1px solid #30363d', color: 'white', borderRadius: '4px' }}
                                    >
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Bug Report">Bug / Issue Report</option>
                                        <option value="Scenario Feedback">Scenario Feedback</option>
                                        <option value="Account Assistance">Account Assistance</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ textAlign: 'left' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c9d1d9', fontSize: '0.9rem' }}>Message Content</label>
                                    <textarea 
                                        placeholder="Detail your inquiry here..."
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        required
                                        rows="6"
                                        style={{ width: '100%', padding: '0.8rem', background: '#0d1117', border: '1px solid #30363d', color: 'white', borderRadius: '4px', resize: 'vertical' }}
                                    />
                                </div>
                                <button type="submit" disabled={status.loading} style={{ background: '#00f0ff', color: '#0d1117', padding: '1rem', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {status.loading ? 'Transmitting...' : <><Send size={18} /> Transmit Message</>}
                                </button>
                            </form>
                        )}

                        <div className="direct-contact center-contact" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #30363d' }}>
                            <div className="direct-item" style={{ justifyContent: 'center' }}>
                                <div className="direct-icon">
                                    <Mail size={16} />
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.9rem', color: '#8b949e' }}>Or email directly: </span>
                                    <a href="mailto:info@hari07.tech" className="email-link">info@hari07.tech</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
