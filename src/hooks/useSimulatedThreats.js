import { useState, useEffect, useRef } from 'react';

// Generates simulated threat data + mixes with actual recent scenario completions (if provided)
export function useSimulatedThreats(realEvents = []) {
    const [threats, setThreats] = useState([]);
    const [activeNodes, setActiveNodes] = useState([]);

    // Map coordinates for major hubs (approximate SVG pixel coordinates for a standard 1000x500 map)
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

    const attackTypes = [
        { type: 'DDoS', severity: 'high', color: 'var(--danger)' },
        { type: 'Phishing', severity: 'low', color: 'var(--warning)' },
        { type: 'Ransomware', severity: 'critical', color: '#ff00ff' },
        { type: 'Data Exfiltration', severity: 'high', color: 'var(--primary)' },
        { type: 'SQL Injection', severity: 'medium', color: '#00ffff' }
    ];

    useEffect(() => {
        // Procedurally generate attacks
        const generateThreat = () => {
            const sourceHub = hubs[Math.floor(Math.random() * hubs.length)];
            let targetHub = hubs[Math.floor(Math.random() * hubs.length)];

            while (sourceHub.id === targetHub.id) {
                targetHub = hubs[Math.floor(Math.random() * hubs.length)];
            }

            const attack = attackTypes[Math.floor(Math.random() * attackTypes.length)];

            const newThreat = {
                id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                source: sourceHub,
                target: targetHub,
                type: attack.type,
                severity: attack.severity,
                color: attack.color,
                timestamp: new Date()
            };

            setThreats(prev => [newThreat, ...prev].slice(0, 50)); // Keep last 50 in log

            // Activate nodes briefly
            setActiveNodes(prev => {
                const updated = [...prev, sourceHub.id, targetHub.id];
                return [...new Set(updated)];
            });

            // Deactivate nodes after animation
            setTimeout(() => {
                setActiveNodes(prev => prev.filter(id => id !== sourceHub.id && id !== targetHub.id));
            }, 2000);
        };

        // Fire a new threat every 1.5 to 5 seconds
        const threatLoop = () => {
            generateThreat();
            const nextTimeout = Math.random() * 3500 + 1500;
            timeoutRef.current = setTimeout(threatLoop, nextTimeout);
        };

        const timeoutRef = { current: setTimeout(threatLoop, 1000) };

        return () => clearTimeout(timeoutRef.current);
    }, []);

    // Combine real events (completed scenarios) into the log disguised as "Neutralized Threats"
    const combinedLog = [...threats];

    realEvents.forEach(e => {
        // Check if we already incorporated this real event to avoid dupes on re-render
        if (!combinedLog.find(t => t.id === e._id)) {
            combinedLog.push({
                id: e._id,
                type: `Neutralized: ${e.category || 'Threat'}`,
                severity: 'resolved',
                color: 'var(--success)',
                target: hubs[Math.floor(Math.random() * hubs.length)],
                timestamp: new Date(e.completedAt || Date.now()),
                isReal: true,
                agent: e.senderId?.username || 'Unknown Agent'
            });
        }
    });

    // Sort by timestamp descending
    combinedLog.sort((a, b) => b.timestamp - a.timestamp);

    return { activeThreats: threats.slice(0, 10), log: combinedLog.slice(0, 50), hubs, activeNodes };
}
