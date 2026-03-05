import { useState, useEffect, useRef } from 'react';
import { buildApiUrl } from '../utils/api';

// Bridges real OTX Threat Intel with the Visual Map
export function useSimulatedThreats(realEvents = []) {
    const [threats, setThreats] = useState([]);
    const [activeNodes, setActiveNodes] = useState([]);
    const [otxFeed, setOtxFeed] = useState([]);

    // Map coordinates for major hubs
    const hubs = [
        { id: 'tokyo', name: 'Tokyo-01', x: 850, y: 180, type: 'datacenter' },
        { id: 'london', name: 'London-Prime', x: 480, y: 150, type: 'finance' },
        { id: 'ny', name: 'NY-Gateway', x: 280, y: 170, type: 'defense' },
        { id: 'sp', name: 'São Paulo-Net', x: 330, y: 350, type: 'infrastructure' },
        { id: 'sydney', name: 'Sydney-Comm', x: 920, y: 400, type: 'comm' },
        { id: 'moscow', name: 'Moscow-Grid', x: 600, y: 110, type: 'defense' },
        { id: 'sf', name: 'SF-Tech', x: 180, y: 180, type: 'datacenter' },
        { id: 'singapore', name: 'Singapore-Hub', x: 780, y: 280, type: 'finance' }
    ];

    const attackStyles = [
        { type: 'DDoS', color: '#ff4444' },
        { type: 'Phishing', color: '#ffbb33' },
        { type: 'Malware', color: '#aa66cc' },
        { type: 'Exfiltration', color: '#33b5e5' }
    ];

    // Fetch Real OTX Data
    useEffect(() => {
        const fetchOTX = async () => {
            try {
                const res = await fetch(buildApiUrl('/api/threats/live'));
                const data = await res.json();
                if (Array.isArray(data)) {
                    setOtxFeed(data);
                }
            } catch (err) {
                console.error("OTX Fetch Failed:", err);
            }
        };

        fetchOTX();
        const interval = setInterval(fetchOTX, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    // Procedural Animation Loop (using real types from feed if available)
    useEffect(() => {
        const triggerVisualAttack = () => {
            const sourceHub = hubs[Math.floor(Math.random() * hubs.length)];
            let targetHub = hubs[Math.floor(Math.random() * hubs.length)];
            while (sourceHub.id === targetHub.id) targetHub = hubs[Math.floor(Math.random() * hubs.length)];

            // Pick a type from the real OTX feed if possible, else fallback
            const realType = otxFeed.length > 0
                ? otxFeed[Math.floor(Math.random() * otxFeed.length)].type
                : attackStyles[Math.floor(Math.random() * attackStyles.length)].type;

            const style = attackStyles.find(s => realType.toLowerCase().includes(s.type.toLowerCase())) || attackStyles[0];

            const newVisualThreat = {
                id: `v-${Date.now()}`,
                source: sourceHub,
                target: targetHub,
                type: realType.length > 30 ? realType.substring(0, 30) + '...' : realType,
                color: style.color,
                timestamp: new Date()
            };

            setThreats(prev => [newVisualThreat, ...prev].slice(0, 10));
            setActiveNodes(prev => [...new Set([...prev, sourceHub.id, targetHub.id])]);
            setTimeout(() => {
                setActiveNodes(prev => prev.filter(id => id !== sourceHub.id && id !== targetHub.id));
            }, 2500);
        };

        const loop = setInterval(triggerVisualAttack, 4000);
        return () => clearInterval(loop);
    }, [otxFeed]);

    // Combine OTX Feed + Local Session Progress
    const combinedLog = otxFeed.map(f => {
        const sourceHub = hubs[Math.floor(Math.random() * hubs.length)];
        const targetHub = hubs[Math.floor(Math.random() * hubs.length)];
        return {
            ...f,
            source: sourceHub,
            target: targetHub,
            timestamp: new Date(f.timestamp),
            color: attackStyles.find(s => f.type.toLowerCase().includes(s.type.toLowerCase()))?.color || '#00C851'
        };
    });

    realEvents.forEach(e => {
        combinedLog.push({
            id: e._id,
            type: `Neutralized: ${e.category || 'Threat'}`,
            color: '#00C851',
            target: hubs[Math.floor(Math.random() * hubs.length)],
            timestamp: new Date(e.completedAt || Date.now()),
            isReal: true,
            agent: e.senderId?.username || 'Unknown Agent'
        });
    });

    combinedLog.sort((a, b) => b.timestamp - a.timestamp);

    return {
        activeThreats: threats,
        log: combinedLog.slice(0, 50),
        hubs,
        activeNodes
    };
}

