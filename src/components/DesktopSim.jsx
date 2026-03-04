import React, { useState, useEffect } from 'react';
import {
    X,
    Monitor,
    HardDrive,
    Trash2,
    Folder,
    ShieldAlert,
    Search,
    Wifi,
    Battery,
    Bell,
    ExternalLink
} from 'lucide-react';
import './DesktopSim.css';

export default function DesktopSim({ vd, onAction }) {
    const [windows, setWindows] = useState([]);
    const [draggedFile, setDraggedFile] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Load initial windows from visualData
    useEffect(() => {
        if (vd?.windows) {
            setWindows(vd.windows.map((w, i) => ({ ...w, id: `win-${i}`, isOpen: true, zIndex: i + 10 })));
        }
    }, [vd]);

    const handleCloseWindow = (id) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
        const closedWin = windows.find(w => w.id === id);
        if (closedWin?.actionOnClose && onAction) {
            onAction(closedWin.actionOnClose);
        }
    };

    const bringToFront = (id) => {
        setWindows(prev => {
            const maxZ = Math.max(...prev.map(w => w.zIndex), 10);
            return prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w);
        });
    };

    const onFileDragStart = (e, file) => {
        setDraggedFile(file);
        e.dataTransfer.setData('fileName', file.name);
    };

    const onTrashDrop = (e) => {
        e.preventDefault();
        if (draggedFile && onAction) {
            onAction({ type: 'delete', fileName: draggedFile.name });
            setDraggedFile(null);
        }
    };

    const allowDrop = (e) => e.preventDefault();

    const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' });

    return (
        <div className="desktop-env">
            {/* Desktop Icons */}
            <div className="desktop-icons">
                <div className="desktop-icon">
                    <HardDrive size={32} />
                    <span>OS (C:)</span>
                </div>
                <div className="desktop-icon">
                    <Monitor size={32} />
                    <span>My Computer</span>
                </div>
                <div className="desktop-icon">
                    <Folder size={32} />
                    <span>User Data</span>
                </div>

                {vd?.files?.map((file, i) => (
                    <div
                        key={i}
                        className="desktop-icon draggable"
                        draggable
                        onDragStart={(e) => onFileDragStart(e, file)}
                    >
                        {file.type === 'malware' ? <ShieldAlert size={32} color="var(--danger)" className="flicker" /> : <Folder size={32} color="var(--primary)" />}
                        <span>{file.name}</span>
                    </div>
                ))}

                <div
                    className={`desktop-icon trash-can ${draggedFile ? 'highlight' : ''}`}
                    onDrop={onTrashDrop}
                    onDragOver={allowDrop}
                >
                    <Trash2 size={40} />
                    <span>Recycle Bin</span>
                </div>
            </div>

            {/* Active Windows */}
            {windows.filter(w => w.isOpen).map(win => (
                <div
                    key={win.id}
                    className={`sim-window ${win.type === 'alert' ? 'alert-window' : ''}`}
                    style={{ zIndex: win.zIndex, top: win.y || '20%', left: win.x || '25%' }}
                    onClick={() => bringToFront(win.id)}
                >
                    <div className="window-header">
                        <div className="window-title">
                            {win.type === 'alert' ? <ShieldAlert size={14} /> : <ExternalLink size={14} />}
                            {win.title}
                        </div>
                        <div className="window-controls">
                            <button className="win-btn close" onClick={() => handleCloseWindow(win.id)}>
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="window-content">
                        {win.content}
                        {win.type === 'alert' && win.isFlashing && <div className="overlay-flash" />}
                    </div>
                </div>
            ))}

            {/* Taskbar */}
            <div className="taskbar">
                <div className="taskbar-left">
                    <div className="start-btn">
                        <Monitor size={18} />
                    </div>
                    <div className="taskbar-search">
                        <Search size={14} />
                        <input type="text" placeholder="Search..." disabled />
                    </div>
                </div>

                <div className="taskbar-center">
                    {windows.filter(w => w.isOpen).map(w => (
                        <div key={w.id} className="task-item active">
                            {w.title.slice(0, 10)}...
                        </div>
                    ))}
                </div>

                <div className="taskbar-right">
                    <Wifi size={14} />
                    <Battery size={14} />
                    <Bell size={14} />
                    <div className="taskbar-time">
                        <div>{formattedTime}</div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.7 }}>{formattedDate}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
