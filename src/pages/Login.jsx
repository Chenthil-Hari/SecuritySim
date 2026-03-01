import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Smartphone, KeyRound, ArrowRight, X } from 'lucide-react';
import './Login.css';

export default function Login() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [showOtpPopup, setShowOtpPopup] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { loginAnonymous, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        setIsLoading(true);

        // Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otp);

        // Simulate a small network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        setIsOtpSent(true);
        setShowOtpPopup(true);
        setIsLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!verificationCode) {
            setError('Please enter the 6-digit code');
            return;
        }

        if (verificationCode !== generatedOtp) {
            setError('Incorrect verification code. Please try again.');
            return;
        }

        setIsLoading(true);
        try {
            await loginAnonymous();
            navigate('/dashboard');
        } catch (err) {
            console.error("Login Error:", err);
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Google login failed.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">
                        <Shield size={32} />
                    </div>
                    <h2>Welcome to SecuritySim</h2>
                    <p>
                        {isOtpSent
                            ? 'Enter the 6-digit code to verify'
                            : 'Sign in with your phone number or Google'}
                    </p>
                </div>

                {error && <div className="login-error">{error}</div>}

                {!isOtpSent ? (
                    <form className="login-form" onSubmit={handleSendOtp}>
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <div className="input-with-icon">
                                <Smartphone size={18} />
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    required
                                />
                            </div>
                            <small style={{ color: '#8b9bb4', marginTop: '0.5rem', display: 'block', fontSize: '0.8rem' }}>
                                Include your country code (e.g. +1 or +91)
                            </small>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary login-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : (
                                <>
                                    Send OTP <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form className="login-form" onSubmit={handleVerifyOtp}>
                        <div className="form-group">
                            <label htmlFor="code">Verification Code</label>
                            <div className="input-with-icon">
                                <KeyRound size={18} />
                                <input
                                    type="text"
                                    id="code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength="6"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary login-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <button
                                type="button"
                                className="toggle-btn"
                                onClick={() => {
                                    setIsOtpSent(false);
                                    setVerificationCode('');
                                    setGeneratedOtp('');
                                    setError('');
                                }}
                            >
                                Use a different phone number
                            </button>
                        </div>
                    </form>
                )}

                <div className="login-divider">
                    <span>OR</span>
                </div>

                <button
                    type="button"
                    className="btn-outline google-btn"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Continue with Google
                </button>
            </div>

            {/* OTP Popup */}
            {showOtpPopup && (
                <div className="otp-popup-overlay">
                    <div className="otp-popup">
                        <button
                            className="otp-popup-close"
                            onClick={() => setShowOtpPopup(false)}
                        >
                            <X size={20} />
                        </button>
                        <div className="otp-popup-icon">📱</div>
                        <h3>Your OTP Code</h3>
                        <p>A verification code has been sent to <strong>{phoneNumber}</strong></p>
                        <div className="otp-code-display">{generatedOtp}</div>
                        <p className="otp-popup-hint">Enter this code in the verification field</p>
                        <button
                            className="btn-primary"
                            onClick={() => setShowOtpPopup(false)}
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
