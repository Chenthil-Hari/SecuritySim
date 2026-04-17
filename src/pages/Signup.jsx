import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SignUp } from '@clerk/clerk-react';
import { ArrowLeft } from 'lucide-react';
import './Login.css';

const localFadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: { type: 'spring', bounce: 0.4, duration: 0.8 } 
    }
};

const Signup = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-container" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh', 
            position: 'relative',
            background: 'radial-gradient(circle at center, #1a1f2e 0%, #0d1117 100%)'
        }}>
            <button className="back-btn auth-back-btn" onClick={() => navigate('/')} style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
                <ArrowLeft size={18} /> Back to Home
            </button>
            <motion.div 
                initial="hidden"
                animate="show"
                variants={localFadeUp}
                style={{ zIndex: 5 }}
            >
                <SignUp 
                    routing="path" 
                    path="/signup" 
                    signInUrl="/login" 
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
            </motion.div>
        </div>
    );
};

export default Signup;
