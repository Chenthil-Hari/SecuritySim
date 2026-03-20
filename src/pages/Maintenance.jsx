import { AlertTriangle, Clock } from 'lucide-react';
import maintenanceImg from '../assets/maintaince.png';
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
            <div className="maintenance-container">
                <div className="maintenance-image-wrapper">
                    <img src={maintenanceImg} alt="System Maintenance" className="maintenance-image" />
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
