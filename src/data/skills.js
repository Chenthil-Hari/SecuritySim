import { Shield, Target, Activity, Lock, Search, Zap, Crosshair, Terminal, Eye, AlertTriangle } from 'lucide-react';

const skillsData = [
    {
        id: 'net_1',
        name: 'Firewall Fundamentals',
        category: 'Network Security',
        description: 'Increases all XP earned from Network Security scenarios by 10%.',
        cost: 1,
        icon: Shield,
        prerequisites: [],
        position: { x: 2, y: 1 } // for grid placement
    },
    {
        id: 'net_2',
        name: 'Packet Sniffer',
        category: 'Network Security',
        description: 'Increases Network Security score accuracy by a flat 5%.',
        cost: 2,
        icon: Activity,
        prerequisites: ['net_1'],
        position: { x: 2, y: 2 }
    },
    {
        id: 'soc_1',
        name: 'Phishing Detector',
        category: 'Social Engineering',
        description: 'Grants +5 bonus seconds on all timed scenarios.',
        cost: 1,
        icon: Eye,
        prerequisites: [],
        position: { x: 1, y: 1 }
    },
    {
        id: 'soc_2',
        name: 'Trust No One',
        category: 'Social Engineering',
        description: 'Increases all XP earned from Social Engineering scenarios by 15%.',
        cost: 2,
        icon: Lock,
        prerequisites: ['soc_1'],
        position: { x: 1, y: 2 }
    },
    {
        id: 'inc_1',
        name: 'First Responder',
        category: 'Incident Response',
        description: 'Reduces the XP penalty for incorrect answers by 50%.',
        cost: 1,
        icon: AlertTriangle,
        prerequisites: [],
        position: { x: 3, y: 1 }
    },
    {
        id: 'inc_2',
        name: 'Malware Analyst',
        category: 'Incident Response',
        description: 'Increases all XP earned from Incident Response scenarios by 15%.',
        cost: 2,
        icon: Zap,
        prerequisites: ['inc_1'],
        position: { x: 3, y: 2 }
    },
    {
        id: 'master_1',
        name: 'Omniscient Architect',
        category: 'Mastery',
        description: 'Global +20% XP boost to all activities.',
        cost: 3,
        icon: Target,
        prerequisites: ['net_2', 'soc_2', 'inc_2'],
        position: { x: 2, y: 3 }
    }
];

export default skillsData;
