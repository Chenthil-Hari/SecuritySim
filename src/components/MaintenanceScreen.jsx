import { Shield, Lock, ExternalLink } from 'lucide-react';
import maintenanceImg from '../assets/Gemini_Generated_Image_cejcaacejcaacejc_small.png';
import './MaintenanceScreen.css';

export default function MaintenanceScreen() {
    return (
        <div className="maintenance-screen">
            <div className="maintenance-overlay">
                <div className="maintenance-card animate-pop">
                    <div className="card-header">
                        <Shield size={32} className="status-glow" />
                        <h1>System Under Maintenance</h1>
                    </div>
                    
                    <div className="maintenance-image-container">
                        <img src={maintenanceImg} alt="Maintenance Illustration" className="premium-image" />
                    </div>

                    <div className="maintenance-body">
                        <p>
                            The SecuritySim platform is currently undergoing critical tactical updates.
                            Our systems are being fortified to provide you with the next level of cyber defense training.
                        </p>
                        
                        <div className="status-tracker">
                            <div className="pulse-indicator"></div>
                            <span>ETA: Stand by for Headquarters signal.</span>
                        </div>
                    </div>

                    <div className="maintenance-footer">
                        <div className="security-badge">
                            <Lock size={14} /> Encrypted Access Only
                        </div>
                        <a href="/admin" className="admin-bypass-link">
                            Admin Access <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
            </div>
            
            {/* Background Matrix Effect could be here if needed */}
            <div className="maintenance-bg-glow"></div>
        </div>
    );
}
