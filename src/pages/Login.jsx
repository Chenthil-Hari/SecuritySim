import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
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

const Login = () => {
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
                <SignIn 
                    routing="path" 
                    path="/login" 
                    signUpUrl="/signup" 
                />
            </motion.div>
        </div>
    );
};

export default Login;
