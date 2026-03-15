import { Shield, AlertTriangle, Clock } from 'lucide-react';
import './Maintenance.css';

export default function Maintenance({ expectedReturn }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'Soon';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Soon';
        }
    };

    return (
        <div className="maintenance-page">
            <video autoPlay loop muted playsInline className="maintenance-video-bg">
                <source src="/Maintainance.mp4" type="video/mp4" />
            </video>
            <div className="maintenance-container">
                <div className="maintenance-icon">
                    <Shield size={64} className="shield-glow" />
                    <AlertTriangle size={32} className="warning-overlay" />
                </div>
                
                <h1>System Lockdown Active</h1>
                <div className="status-badge">MAINTENANCE IN PROGRESS</div>
                
                <p>
                    SecuritySim is currently undergoing a scheduled tactical upgrade to improve our defensive capabilities.
                    All training modules and investigator terminals are temporarily offline.
                </p>

                <div className="maintenance-details">
                    <div className="detail-item">
                        <Clock size={20} />
                        <span>Expected Return: {formatDate(expectedReturn)}</span>
                    </div>
                </div>

                <div className="maintenance-footer">
                    <p>Intelligence gathering continues behind the scenes.</p>
                    <div className="progress-mini">
                        <div className="progress-fill"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
