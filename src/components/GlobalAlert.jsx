import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Info, AlertTriangle, X, Bell, Shield } from 'lucide-react';
import './GlobalAlert.css';

export default function GlobalAlert() {
    const [alert, setAlert] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Connect to the same origin as the app
        const socket = io(window.location.origin);

        socket.on('system_broadcast', (data) => {
            setAlert(data);
            setIsVisible(true);
            
            // Auto-hide after 15 seconds for non-maintenance alerts
            if (data.type !== 'maintenance') {
                const timer = setTimeout(() => {
                    setIsVisible(false);
                }, 15000);
                return () => clearTimeout(timer);
            }
        });

        return () => socket.disconnect();
    }, []);

    if (!isVisible || !alert) return null;

    const getIcon = () => {
        switch (alert.type) {
            case 'warning': return <AlertTriangle size={20} />;
            case 'maintenance': return <Shield size={20} />;
            default: return <Bell size={20} />;
        }
    };

    return (
        <div className={`global-alert-overlay ${alert.type}`}>
            <div className="global-alert-content animate-slide-down">
                <div className="alert-icon-wrapper">
                    {getIcon()}
                </div>
                <div className="alert-body">
                    <div className="alert-header">
                        <span className="sender-tag">{alert.sender}</span>
                        <span className="timestamp">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="alert-message">{alert.message}</p>
                </div>
                <button className="close-alert-btn" onClick={() => setIsVisible(false)}>
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
