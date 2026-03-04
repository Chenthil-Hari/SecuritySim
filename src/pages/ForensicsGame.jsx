import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Folder, File, FileText, FileImage, FileCode, FileArchive,
    ArrowLeft, HardDrive, Clock, AlertTriangle, Shield, ShieldAlert,
    ChevronRight, RotateCcw, Zap, CheckCircle, XCircle, Skull,
    Monitor, Search, Ban
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import './ForensicsGame.css';

/* ====================================================
   MISSION DEFINITIONS
   Each mission = a unique file-system layout + hidden threats
   ==================================================== */

const MISSIONS = [
    {
        id: 'mission-1',
        title: 'The Suspicious PDF',
        briefing: 'An employee reports their PC is slow after downloading an invoice. Find and quarantine the malicious payload hiding in their system.',
        difficulty: 1,
        timeLimit: 90,
        xpReward: 40,
        fileSystem: {
            name: 'C:',
            type: 'drive',
            children: [
                {
                    name: 'Windows',
                    type: 'folder',
                    children: [
                        {
                            name: 'System32',
                            type: 'folder',
                            children: [
                                { name: 'cmd.exe', type: 'file', ext: 'exe', size: '276 KB', modified: '2019-03-15', icon: 'exe', suspicious: false, explanation: 'Standard Windows Command Processor. This is a legitimate system file used for executing commands.' },
                                { name: 'notepad.exe', type: 'file', ext: 'exe', size: '193 KB', modified: '2019-03-15', icon: 'exe', suspicious: false, explanation: 'Official Microsoft Notepad executable. A core utility for text editing.' },
                                { name: 'svchost.exe', type: 'file', ext: 'exe', size: '51 KB', modified: '2019-03-15', icon: 'exe', suspicious: false, explanation: 'Genuine Service Host process. Windows uses this to host multiple services to reduce resource usage.' },
                                { name: 'svch0st.exe', type: 'file', ext: 'exe', size: '847 KB', modified: '2025-03-04 23:41', icon: 'exe', suspicious: true, threatType: 'trojan', hint: 'Notice the zero instead of "o" — classic trojan naming.', explanation: 'Typosquatting/Homoglyph attack. Attackers use names like "svch0st.exe" (with a zero) to hide alongside legitimate "svchost.exe" files.' },
                            ]
                        },
                        { name: 'explorer.exe', type: 'file', ext: 'exe', size: '3.1 MB', modified: '2019-03-15', icon: 'exe', suspicious: false, explanation: 'Windows Explorer. This is the legitimate process responsible for the taskbar, desktop, and file management.' },
                    ]
                },
                {
                    name: 'Users',
                    type: 'folder',
                    children: [
                        {
                            name: 'Admin',
                            type: 'folder',
                            children: [
                                {
                                    name: 'Desktop',
                                    type: 'folder',
                                    children: [
                                        { name: 'Q4_Report.xlsx', type: 'file', ext: 'xlsx', size: '245 KB', modified: '2025-02-28', icon: 'doc', suspicious: false, explanation: 'A standard Excel spreadsheet. No suspicious macros or external calls detected.' },
                                        { name: 'meeting_notes.docx', type: 'file', ext: 'docx', size: '18 KB', modified: '2025-03-01', icon: 'doc', suspicious: false, explanation: 'A standard Word document containing internal meeting minutes.' },
                                    ]
                                },
                                {
                                    name: 'Downloads',
                                    type: 'folder',
                                    children: [
                                        { name: 'invoice_march.pdf.exe', type: 'file', ext: 'exe', size: '1.2 MB', modified: '2025-03-04 23:38', icon: 'pdf-exe', suspicious: true, threatType: 'dropper', hint: 'Double extension! This appears to be a PDF but is actually an executable.', explanation: 'Double Extension Attack. Windows hides known extensions by default, so "invoice.pdf.exe" appears as "invoice.pdf" to the user, tricking them into running code.' },
                                        { name: 'chrome_setup.msi', type: 'file', ext: 'msi', size: '89 MB', modified: '2025-02-20', icon: 'installer', suspicious: false, explanation: 'Digitally signed Google Chrome installer. A common and safe software installer.' },
                                        { name: 'vacation_photo.jpg', type: 'file', ext: 'jpg', size: '3.4 MB', modified: '2025-02-14', icon: 'image', suspicious: false, explanation: 'A legitimate JPEG image. Standard file headers and no embedded scripts found.' },
                                    ]
                                },
                                {
                                    name: 'AppData',
                                    type: 'folder',
                                    children: [
                                        {
                                            name: 'Local',
                                            type: 'folder',
                                            children: [
                                                {
                                                    name: 'Temp',
                                                    type: 'folder',
                                                    children: [
                                                        { name: 'update_service.bat', type: 'file', ext: 'bat', size: '4 KB', modified: '2025-03-04 23:39', icon: 'script', suspicious: true, threatType: 'persistence', hint: 'Created seconds after the PDF dropper was run.', explanation: 'Persistence Mechanism. This batch script was configured to run "svch0st.exe" every time the computer reboots, ensuring the infection survives a restart.' },
                                                        { name: 'tmpA23F.tmp', type: 'file', ext: 'tmp', size: '0 KB', modified: '2025-03-02', icon: 'file', suspicious: false, explanation: 'A temporary system file. Common in the Temp directory and poses no threat.' },
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    name: 'Documents',
                                    type: 'folder',
                                    children: [
                                        { name: 'budget_2025.xlsx', type: 'file', ext: 'xlsx', size: '156 KB', modified: '2025-01-15', icon: 'doc', suspicious: false, explanation: 'Internal financial document. Last modified months ago, consistent with legitimate use.' },
                                        { name: 'project_plan.pptx', type: 'file', ext: 'pptx', size: '2.1 MB', modified: '2025-02-10', icon: 'doc', suspicious: false, explanation: 'Standard PowerPoint presentation for project roadmapping.' },
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'Program Files',
                    type: 'folder',
                    children: [
                        {
                            name: 'Google', type: 'folder', children: [
                                {
                                    name: 'Chrome', type: 'folder', children: [
                                        { name: 'chrome.exe', type: 'file', ext: 'exe', size: '2.8 MB', modified: '2025-01-10', icon: 'exe', suspicious: false, explanation: 'The official Google Chrome browser executable, located in the correct Program Files path.' }
                                    ]
                                }
                            ]
                        },
                        {
                            name: 'Microsoft Office', type: 'folder', children: [
                                { name: 'WINWORD.EXE', type: 'file', ext: 'exe', size: '1.9 MB', modified: '2024-11-05', icon: 'exe', suspicious: false, explanation: 'Microsoft Word executable. A standard application component.' }
                            ]
                        }
                    ]
                }
            ]
        },
        totalThreats: 3,
    },
    {
        id: 'mission-2',
        title: 'The Insider Exfiltration',
        briefing: 'Security detected massive outbound data transfers at 3AM. An insider may be stealing company secrets. Find the exfiltration tools before they cover their tracks.',
        difficulty: 2,
        timeLimit: 75,
        xpReward: 60,
        fileSystem: {
            name: 'C:',
            type: 'drive',
            children: [
                {
                    name: 'Windows',
                    type: 'folder',
                    children: [
                        {
                            name: 'System32',
                            type: 'folder',
                            children: [
                                { name: 'cmd.exe', type: 'file', ext: 'exe', size: '276 KB', modified: '2019-03-15', icon: 'exe', suspicious: false, explanation: 'Legitimate Windows Command Prompt.' },
                                { name: 'powershell.exe', type: 'file', ext: 'exe', size: '452 KB', modified: '2019-03-15', icon: 'exe', suspicious: false, explanation: 'Legitimate Windows PowerShell engine.' },
                            ]
                        },
                        {
                            name: 'Tasks',
                            type: 'folder',
                            children: [
                                { name: 'GoogleUpdateTask.xml', type: 'file', ext: 'xml', size: '2 KB', modified: '2025-01-10', icon: 'code', suspicious: false, explanation: 'A standard scheduled task for Google Chrome updates.' },
                                { name: 'SystemSyncTask.xml', type: 'file', ext: 'xml', size: '3 KB', modified: '2025-03-04 02:58', icon: 'code', suspicious: true, threatType: 'scheduled-task', hint: 'A scheduled task created at 2:58 AM — right before the transfer.', explanation: 'Automation of Exfiltration. Using the Windows Task Scheduler, the attacker automated the upload script to run hidden at night.' },
                            ]
                        }
                    ]
                },
                {
                    name: 'Users',
                    type: 'folder',
                    children: [
                        {
                            name: 'jsmith',
                            type: 'folder',
                            children: [
                                {
                                    name: 'Desktop',
                                    type: 'folder',
                                    children: [
                                        { name: 'work_files.lnk', type: 'file', ext: 'lnk', size: '1 KB', modified: '2025-02-28', icon: 'file', suspicious: false, explanation: 'A standard shortcut link to a work directory.' },
                                    ]
                                },
                                {
                                    name: 'Documents',
                                    type: 'folder',
                                    children: [
                                        { name: 'salary_data_ALL.csv', type: 'file', ext: 'csv', size: '14 MB', modified: '2025-03-04 01:15', icon: 'doc', suspicious: true, threatType: 'stolen-data', hint: '14MB CSV of ALL employee salaries, created at 1:15 AM.', explanation: 'Data Staging. The insider exported sensitive HR data and stored it in a generic folder before exfiltrating it.' },
                                        { name: 'personal_budget.xlsx', type: 'file', ext: 'xlsx', size: '45 KB', modified: '2025-01-20', icon: 'doc', suspicious: false, explanation: 'A user\'s personal budget file. No sensitive company data detected.' },
                                    ]
                                },
                                {
                                    name: 'AppData',
                                    type: 'folder',
                                    children: [
                                        {
                                            name: 'Local',
                                            type: 'folder',
                                            children: [
                                                {
                                                    name: 'Temp',
                                                    type: 'folder',
                                                    children: [
                                                        { name: 'rclone.exe', type: 'file', ext: 'exe', size: '45 MB', modified: '2025-03-03 23:50', icon: 'exe', suspicious: true, threatType: 'exfil-tool', hint: 'Cloud sync tool frequently used by hackers for exfiltration.', explanation: 'Dual-Use Tool Abuse. Rclone is powerful for cloud sync but is the #1 tool for attackers to quickly upload Gigabytes of stolen data to their own cloud storage.' },
                                                        { name: 'rclone.conf', type: 'file', ext: 'conf', size: '1 KB', modified: '2025-03-04 00:05', icon: 'code', suspicious: true, threatType: 'exfil-config', hint: 'Rclone config file pointing to a personal Mega.nz account.', explanation: 'Attacker Infrastructure. This configuration file contains the credentials for the attacker\'s personal storage, confirming the intent to steal data.' },
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    name: 'Downloads',
                                    type: 'folder',
                                    children: [
                                        { name: '7z.exe', type: 'file', ext: 'exe', size: '1.1 MB', modified: '2025-03-03 23:45', icon: 'archive', suspicious: false, explanation: 'Legitimate 7-Zip archiver. Used for compressing files.' },
                                        { name: 'client_contracts_Q1.7z', type: 'file', ext: '7z', size: '340 MB', modified: '2025-03-04 02:30', icon: 'archive', suspicious: true, threatType: 'compressed-loot', hint: '340MB archive of contracts staged for upload.', explanation: 'Data Compression for Speed. Attackers compress large datasets into single archives (often password-protected) to make exfiltration faster and bypass some network monitoring.' },
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'Program Files',
                    type: 'folder',
                    children: [
                        {
                            name: 'Microsoft Office', type: 'folder', children: [
                                { name: 'EXCEL.EXE', type: 'file', ext: 'exe', size: '2.3 MB', modified: '2024-11-05', icon: 'exe', suspicious: false, explanation: 'Official Microsoft Excel executable.' }
                            ]
                        }
                    ]
                }
            ]
        },
        totalThreats: 5,
    }
];

/* ====================================================
   ICON HELPER
   ==================================================== */
function FileIcon({ iconType, suspicious }) {
    const color = suspicious ? '#ef4444' : 'var(--text-muted)';
    const size = 16;
    switch (iconType) {
        case 'exe': return <FileCode size={size} color={color} />;
        case 'pdf-exe': return <FileText size={size} color="#ef4444" />;
        case 'doc': return <FileText size={size} color={color} />;
        case 'image': return <FileImage size={size} color={color} />;
        case 'archive': return <FileArchive size={size} color={color} />;
        case 'script': return <FileCode size={size} color={color} />;
        case 'code': return <FileCode size={size} color={color} />;
        case 'installer': return <FileArchive size={size} color={color} />;
        default: return <File size={size} color={color} />;
    }
}

/* ====================================================
   HELPER: collect all threats from a file-system tree
   ==================================================== */
function collectThreats(node, path = '') {
    let threats = [];
    const currentPath = path ? `${path}\\${node.name}` : node.name;
    if (node.suspicious) {
        threats.push({ ...node, path: currentPath });
    }
    if (node.children) {
        node.children.forEach(child => {
            threats = threats.concat(collectThreats(child, currentPath));
        });
    }
    return threats;
}

/* ====================================================
   MAIN COMPONENT
   ==================================================== */
export default function ForensicsGame() {
    const { dispatch } = useGame();
    const [selectedMission, setSelectedMission] = useState(null);
    const [currentPath, setCurrentPath] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [gameState, setGameState] = useState('menu'); // menu | playing | success | failed
    const [quarantined, setQuarantined] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [wrongGuesses, setWrongGuesses] = useState([]); // Store objects with name and explanation
    const [scanAnimation, setScanAnimation] = useState(null);
    const [showHint, setShowHint] = useState(null);
    const [guidance, setGuidance] = useState(null); // Educational guidance for clean files
    const timerRef = useRef(null);

    // Get current directory node
    const getCurrentNode = useCallback(() => {
        if (!selectedMission) return null;
        let node = selectedMission.fileSystem;
        for (const segment of currentPath) {
            node = node.children?.find(c => c.name === segment);
            if (!node) return null;
        }
        return node;
    }, [selectedMission, currentPath]);

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current);
                    setGameState('failed');
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [gameState]);

    // Check win condition
    useEffect(() => {
        if (gameState !== 'playing' || !selectedMission) return;
        const allThreats = collectThreats(selectedMission.fileSystem);
        if (quarantined.length === allThreats.length) {
            clearInterval(timerRef.current);
            setGameState('success');
        }
    }, [quarantined, gameState, selectedMission]);

    const startMission = (mission) => {
        setSelectedMission(mission);
        setCurrentPath([]);
        setTimeLeft(mission.timeLimit);
        setQuarantined([]);
        setWrongGuesses([]);
        setSelectedFile(null);
        setShowHint(null);
        setGuidance(null);
        setGameState('playing');
    };

    const navigateToFolder = (folderName) => {
        setCurrentPath(prev => [...prev, folderName]);
        setSelectedFile(null);
        setShowHint(null);
    };

    const navigateUp = () => {
        setCurrentPath(prev => prev.slice(0, -1));
        setSelectedFile(null);
        setShowHint(null);
    };

    const navigateToBreadcrumb = (index) => {
        setCurrentPath(prev => prev.slice(0, index));
        setSelectedFile(null);
        setShowHint(null);
    };

    const selectFile = (file) => {
        setSelectedFile(file);
        setShowHint(null);
    };

    const quarantineFile = (file) => {
        const filePath = [...currentPath, file.name].join('\\');
        if (quarantined.includes(filePath)) return;

        if (file.suspicious) {
            setScanAnimation('threat-found');
            setQuarantined(prev => [...prev, filePath]);
            setShowHint(file.explanation); // Show educational explanation instead of hint
            setGuidance(null);
        } else {
            setScanAnimation('clean');
            setWrongGuesses(prev => [...prev, { name: file.name, explanation: file.explanation }]);
            setGuidance(file.explanation);
            setTimeLeft(prev => Math.max(0, prev - 10)); // Penalty: lose 10 sec
            setShowHint(null);
        }

        setTimeout(() => {
            setScanAnimation(null);
            setGuidance(null);
        }, 4000); // Increase time to read explanation
    };

    const currentNode = getCurrentNode();
    const allThreats = selectedMission ? collectThreats(selectedMission.fileSystem) : [];

    // ========== MENU ==========
    if (gameState === 'menu') {
        return (
            <div className="forensics-page">
                <Link to="/dashboard" className="forensics-back"><ArrowLeft size={16} /> Dashboard</Link>
                <div className="forensics-hero">
                    <div className="forensics-hero-icon">
                        <Search size={32} />
                    </div>
                    <h1>File System Forensics</h1>
                    <p>Investigate compromised systems. Find and quarantine malicious files before the attacker covers their tracks.</p>
                </div>

                <div className="forensics-rules">
                    <h3><Shield size={16} /> How It Works</h3>
                    <div className="rules-grid">
                        <div className="rule-item"><Folder size={16} /> <span>Navigate the fake file system like a real explorer</span></div>
                        <div className="rule-item"><Search size={16} /> <span>Click files to inspect them — check extensions, sizes, and timestamps</span></div>
                        <div className="rule-item"><Ban size={16} /> <span>Click ☢️ Quarantine to flag suspicious files</span></div>
                        <div className="rule-item"><Clock size={16} /> <span>Wrong quarantines cost you 10 seconds. Be precise!</span></div>
                    </div>
                </div>

                <h2 className="missions-title"><ShieldAlert size={20} /> Select Mission</h2>
                <div className="mission-grid">
                    {MISSIONS.map(m => (
                        <div className="mission-card" key={m.id} onClick={() => startMission(m)}>
                            <div className="mission-card-header">
                                <span className="mission-difficulty">
                                    {'★'.repeat(m.difficulty)}{'☆'.repeat(3 - m.difficulty)}
                                </span>
                                <span className="mission-xp"><Zap size={12} /> {m.xpReward} XP</span>
                            </div>
                            <h3>{m.title}</h3>
                            <p>{m.briefing}</p>
                            <div className="mission-meta">
                                <span><Clock size={12} /> {m.timeLimit}s</span>
                                <span><AlertTriangle size={12} /> {m.totalThreats} threats</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ========== SUCCESS / FAILED ==========
    if (gameState === 'success' || gameState === 'failed') {
        const isSuccess = gameState === 'success';
        const timeBonus = isSuccess ? Math.round(timeLeft * 0.5) : 0;
        const accuracyPenalty = wrongGuesses * 5;
        const totalXp = isSuccess ? Math.max(0, selectedMission.xpReward + timeBonus - accuracyPenalty) : 0;

        return (
            <div className="forensics-page">
                <div className={`forensics-result ${isSuccess ? 'result-success' : 'result-failed'}`}>
                    <div className="result-icon">
                        {isSuccess ? <CheckCircle size={64} /> : <Skull size={64} />}
                    </div>
                    <h1>{isSuccess ? 'System Secured!' : 'Investigation Failed'}</h1>
                    <p>{isSuccess
                        ? 'You found and quarantined all malicious files before time ran out.'
                        : 'Time expired. The attacker covered their tracks and the malware persists.'
                    }</p>

                    <div className="result-stats">
                        <div className="result-stat">
                            <span className="stat-label">Threats Found</span>
                            <span className="stat-value">{quarantined.length}/{allThreats.length}</span>
                        </div>
                        <div className="result-stat">
                            <span className="stat-label">Time Left</span>
                            <span className="stat-value">{timeLeft}s</span>
                        </div>
                        <div className="result-stat">
                            <span className="stat-label">Wrong Guesses</span>
                            <span className="stat-value">{wrongGuesses.length}</span>
                        </div>
                        <div className="result-stat">
                            <span className="stat-label">XP Earned</span>
                            <span className="stat-value xp-earned">+{totalXp}</span>
                        </div>
                    </div>

                    <div className="forensics-report">
                        <h2>Forensics Case Report</h2>

                        <div className="report-section">
                            <h3><AlertTriangle size={16} color="#ef4444" /> Threats Neutralized</h3>
                            {allThreats.map((t, i) => {
                                const isFound = quarantined.includes(t.path);
                                return (
                                    <div className={`report-item ${isFound ? 'found' : 'missed'}`} key={i}>
                                        <div className="report-item-header">
                                            <span>{isFound ? '✅' : '❌'} {t.name}</span>
                                            <span className="report-tag">{t.threatType}</span>
                                        </div>
                                        <p>{t.explanation}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {wrongGuesses.length > 0 && (
                            <div className="report-section">
                                <h3><Shield size={16} color="var(--primary)" /> Collateral Damage (Clean Files)</h3>
                                {wrongGuesses.map((g, i) => (
                                    <div className="report-item clean" key={i}>
                                        <div className="report-item-header">
                                            <span>⚠️ {g.name}</span>
                                            <span className="report-tag clean">Legitimate</span>
                                        </div>
                                        <p>{g.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="result-actions">
                        <button className="btn-primary" onClick={() => startMission(selectedMission)}>
                            <RotateCcw size={14} /> Try Again
                        </button>
                        <button className="btn-secondary" onClick={() => setGameState('menu')}>
                            <ArrowLeft size={14} /> Back to Missions
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========== PLAYING ==========
    return (
        <div className="forensics-page forensics-playing">
            {/* Top bar */}
            <div className="forensics-hud">
                <div className="hud-mission">
                    <Monitor size={16} />
                    <span>{selectedMission.title}</span>
                </div>
                <div className="hud-center">
                    <div className={`hud-timer ${timeLeft <= 15 ? 'timer-danger' : ''}`}>
                        <Clock size={14} />
                        <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <div className="hud-threats">
                        <AlertTriangle size={14} />
                        <span>{quarantined.length} / {allThreats.length} threats</span>
                    </div>
                </div>
                <div className="hud-penalties">
                    {wrongGuesses > 0 && <span className="penalty-badge"><XCircle size={12} /> {wrongGuesses} wrong</span>}
                </div>
            </div>

            {/* Briefing bar */}
            <div className="forensics-briefing">
                <ShieldAlert size={14} /> {selectedMission.briefing}
            </div>

            {/* Main explorer */}
            <div className="forensics-explorer">
                {/* Sidebar */}
                <div className="explorer-sidebar">
                    <div className="sidebar-title"><HardDrive size={14} /> Drives</div>
                    <div
                        className={`sidebar-item ${currentPath.length === 0 ? 'active' : ''}`}
                        onClick={() => { setCurrentPath([]); setSelectedFile(null); }}
                    >
                        <HardDrive size={14} /> C:
                    </div>
                    {selectedMission.fileSystem.children?.map(child => (
                        child.type === 'folder' && (
                            <div
                                key={child.name}
                                className={`sidebar-item sidebar-sub ${currentPath[0] === child.name ? 'active' : ''}`}
                                onClick={() => { setCurrentPath([child.name]); setSelectedFile(null); }}
                            >
                                <Folder size={13} /> {child.name}
                            </div>
                        )
                    ))}
                </div>

                {/* Main content area */}
                <div className="explorer-main">
                    {/* Breadcrumb / address bar */}
                    <div className="explorer-address-bar">
                        <span className="address-segment" onClick={() => navigateToBreadcrumb(0)}>C:</span>
                        {currentPath.map((segment, i) => (
                            <span key={i}>
                                <ChevronRight size={12} className="address-sep" />
                                <span
                                    className={`address-segment ${i === currentPath.length - 1 ? 'current' : ''}`}
                                    onClick={() => navigateToBreadcrumb(i + 1)}
                                >
                                    {segment}
                                </span>
                            </span>
                        ))}
                    </div>

                    {/* File listing */}
                    <div className="explorer-file-list">
                        {/* Header */}
                        <div className="file-list-header">
                            <span className="col-name">Name</span>
                            <span className="col-ext">Type</span>
                            <span className="col-size">Size</span>
                            <span className="col-modified">Date Modified</span>
                            <span className="col-action">Action</span>
                        </div>

                        {/* Up button */}
                        {currentPath.length > 0 && (
                            <div className="file-row file-row-up" onClick={navigateUp}>
                                <span className="col-name"><ArrowLeft size={14} /> ..</span>
                                <span className="col-ext"></span>
                                <span className="col-size"></span>
                                <span className="col-modified"></span>
                                <span className="col-action"></span>
                            </div>
                        )}

                        {/* Folders first, then files */}
                        {currentNode?.children
                            ?.sort((a, b) => {
                                if (a.type === 'folder' && b.type !== 'folder') return -1;
                                if (a.type !== 'folder' && b.type === 'folder') return 1;
                                return a.name.localeCompare(b.name);
                            })
                            .map(item => {
                                const itemPath = [...currentPath, item.name].join('\\');
                                const isQuarantined = quarantined.includes(itemPath);

                                return (
                                    <div
                                        key={item.name}
                                        className={`file-row ${selectedFile?.name === item.name ? 'selected' : ''} ${isQuarantined ? 'quarantined' : ''} ${item.suspicious && !isQuarantined ? 'suspicious-hover' : ''}`}
                                        onClick={() => item.type === 'folder' ? navigateToFolder(item.name) : selectFile(item)}
                                    >
                                        <span className="col-name">
                                            {item.type === 'folder'
                                                ? <Folder size={16} color="var(--primary)" />
                                                : <FileIcon iconType={item.icon} suspicious={item.suspicious && !isQuarantined} />
                                            }
                                            <span className={`file-name ${item.suspicious && !isQuarantined ? 'name-suspicious' : ''}`}>
                                                {item.name}
                                            </span>
                                            {isQuarantined && <span className="quarantine-badge">🔒 QUARANTINED</span>}
                                        </span>
                                        <span className="col-ext">{item.ext || 'Folder'}</span>
                                        <span className="col-size">{item.size || '—'}</span>
                                        <span className={`col-modified ${item.suspicious ? 'modified-recent' : ''}`}>
                                            {item.modified || '—'}
                                        </span>
                                        <span className="col-action">
                                            {item.type !== 'folder' && !isQuarantined && (
                                                <button
                                                    className="quarantine-btn"
                                                    onClick={(e) => { e.stopPropagation(); quarantineFile(item); }}
                                                    title="Quarantine this file"
                                                >
                                                    ☢️
                                                </button>
                                            )}
                                        </span>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Detail panel */}
                <div className="explorer-detail-panel">
                    {selectedFile ? (
                        <>
                            <h4>File Inspector</h4>
                            <div className="detail-icon-large">
                                <FileIcon iconType={selectedFile.icon} suspicious={selectedFile.suspicious} />
                            </div>
                            <div className="detail-field">
                                <span className="detail-label">Name</span>
                                <span className="detail-value">{selectedFile.name}</span>
                            </div>
                            <div className="detail-field">
                                <span className="detail-label">Extension</span>
                                <span className={`detail-value ${selectedFile.ext === 'exe' || selectedFile.name.includes('.exe') ? 'ext-danger' : ''}`}>
                                    .{selectedFile.ext}
                                </span>
                            </div>
                            <div className="detail-field">
                                <span className="detail-label">Size</span>
                                <span className="detail-value">{selectedFile.size}</span>
                            </div>
                            <div className="detail-field">
                                <span className="detail-label">Modified</span>
                                <span className={`detail-value ${selectedFile.suspicious ? 'modified-danger' : ''}`}>
                                    {selectedFile.modified}
                                </span>
                            </div>
                            {!quarantined.includes([...currentPath, selectedFile.name].join('\\')) && (
                                <button
                                    className="quarantine-btn-large"
                                    onClick={() => quarantineFile(selectedFile)}
                                >
                                    ☢️ Quarantine File
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="detail-empty">
                            <Search size={24} />
                            <p>Click a file to inspect it</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Scan animation overlay */}
            {scanAnimation && (
                <div className={`scan-overlay ${scanAnimation}`}>
                    {scanAnimation === 'threat-found' ? (
                        <>
                            <AlertTriangle size={48} />
                            <span>☢️ THREAT QUARANTINED</span>
                            {showHint && (
                                <div className="scan-explanation">
                                    <strong>Evidence:</strong>
                                    <p>{showHint}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <XCircle size={48} />
                            <span>✓ FILE IS CLEAN (-10s penalty)</span>
                            {guidance && (
                                <div className="scan-explanation guidance">
                                    <strong>Forensics Guidance:</strong>
                                    <p>{guidance}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
