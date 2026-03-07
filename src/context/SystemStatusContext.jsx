import React, { createContext, useContext, useState, useEffect } from 'react';
import { buildApiUrl } from '../utils/api';

const SystemStatusContext = createContext();

export const SystemStatusProvider = ({ children }) => {
    const [features, setFeatures] = useState({
        teams: true,
        warrooms: true,
        pvp: true,
        ugc: true,
        threat_map: true,
        forensics: true
    });
    const [maintenance, setMaintenance] = useState({ enabled: false, expectedReturn: null });
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            const res = await fetch(buildApiUrl('/api/auth/system-status'));
            if (res.ok) {
                const data = await res.json();
                setFeatures(data.features || {});
                setNews(data.news || []);
                setMaintenance(data.maintenance || { enabled: false });
            }
        } catch (err) {
            console.error("Failed to fetch system status:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        // Refresh status every 5 minutes
        const interval = setInterval(fetchStatus, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <SystemStatusContext.Provider value={{ features, news, maintenance, loading, refreshStatus: fetchStatus }}>
            {children}
        </SystemStatusContext.Provider>
    );
};

export const useSystemStatus = () => {
    const context = useContext(SystemStatusContext);
    if (!context) {
        throw new Error('useSystemStatus must be used within a SystemStatusProvider');
    }
    return context;
};
