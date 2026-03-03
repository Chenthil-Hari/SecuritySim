import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import './Contact.css';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' }); // Reset form
            } else {
                setStatus('error');
                setErrorMessage(data.error || 'Failed to send message.');
            }
        } catch (error) {
            console.error('Contact error:', error);
            setStatus('error');
            setErrorMessage('Network error. Please try again later.');
        }
    };

    return (
        <div className="contact-page">
            <div className="contact-header">
                <h1>Contact Support</h1>
                <p>Have an issue, feedback, or a partnership inquiry? We'd love to hear from you.</p>
            </div>

            <div className="contact-container">
                <div className="contact-info-panel">
                    <div className="info-blob blob-1"></div>
                    <div className="info-blob blob-2"></div>

                    <div className="info-content">
                        <h2>Get in Touch</h2>
                        <p>Fill out the form and our team will get back to you within 24 hours.</p>

                        <div className="direct-contact">
                            <div className="direct-item">
                                <div className="direct-icon">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4>Email Us Directly</h4>
                                    <a href="mailto:info@hari07.tech">info@hari07.tech</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="contact-form-panel">
                    {status === 'success' ? (
                        <div className="success-state animate-scaleIn">
                            <div className="success-icon">
                                <CheckCircle size={48} />
                            </div>
                            <h3>Message Sent!</h3>
                            <p>Thank you for reaching out. We will get back to you at {formData.email} shortly.</p>
                            <button
                                className="btn-primary"
                                onClick={() => setStatus('idle')}
                            >
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="contact-form animate-fadeInUp">
                            {status === 'error' && (
                                <div className="contact-error">
                                    <AlertCircle size={18} />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="name">Your Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                    disabled={status === 'loading'}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                    disabled={status === 'loading'}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="How can we help you?"
                                    rows="5"
                                    required
                                    disabled={status === 'loading'}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader className="spinner" size={18} />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
