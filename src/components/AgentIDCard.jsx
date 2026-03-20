import React, { useState, useRef, useEffect } from 'react';
import { Shield, Zap, Target, Download, Fingerprint, Search } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './AgentIDCard.css';

const AgentIDCard = ({ user }) => {
    const cardRef = useRef(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isScanning, setIsScanning] = useState(false);
    const [lightPos, setLightPos] = useState({ x: 50, y: 50 });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate rotation (max 15 degrees)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 15;
        const rotateX = ((centerY - y) / centerY) * 15;
        
        setRotation({ x: rotateX, y: rotateY });
        
        // Calculate light position for shimmer (%)
        const lightX = (x / rect.width) * 100;
        const lightY = (y / rect.height) * 100;
        setLightPos({ x: lightX, y: lightY });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
    };

    const exportToPDF = async () => {
        if (!cardRef.current) return;
        setIsScanning(true);
        
        try {
            // Give time for the scanning animation to show
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const card = cardRef.current;
            const canvas = await html2canvas(card, {
                scale: 3, // Higher quality
                backgroundColor: null,
                useCORS: true,
                logging: false,
                onclone: (clonedDoc) => {
                    // Remove interactivity markers if any
                    const shimmer = clonedDoc.querySelector('.shimmer-overlay');
                    if (shimmer) shimmer.style.display = 'none';
                }
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width / 2, canvas.height / 2]
            });
            
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
            pdf.save(`Agent_ID_${user.username}.pdf`);
        } catch (err) {
            console.error("Failed to generate Agent ID PDF:", err);
            alert("Digital identity verification failed. Please try again.");
        } finally {
            setIsScanning(false);
        }
    };

    // Simulated Unique ID (UID) if not provided
    const uid = user.uid || `SEC-${user._id?.substring(0, 8).toUpperCase() || 'UNKNOWN'}`;

    return (
        <div className="agent-id-card-viewport">
            <div 
                ref={cardRef}
                className="agent-id-card"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
                }}
            >
                {/* Holographic Shimmer Tracking Mouse */}
                <div 
                    className="shimmer-overlay" 
                    style={{
                        background: `radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, rgba(255, 255, 255, 0.45) 0%, transparent 60%)`
                    }}
                ></div>

                {/* Scan Line Overlay (Only active during PDF generation) */}
                {isScanning && <div className="scanning-line" style={{ display: 'block' }}></div>}

                <div className="card-content">
                    <div className="card-header">
                        <div className="card-logo">
                            <Shield size={20} />
                            <span>SecuritySim // Agent ID</span>
                        </div>
                        <div className="card-chip"></div>
                    </div>

                    <div className="card-body">
                        <div className="card-photo-wrapper">
                            {user.profilePhoto ? (
                                <img src={user.profilePhoto} alt="Agent" className="card-photo" />
                            ) : (
                                <div className="card-photo avatar-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f14' }}>
                                    <Fingerprint size={48} color="rgba(0, 240, 255, 0.3)" />
                                </div>
                            )}
                        </div>

                        <div className="card-info">
                            <div className="card-rank">Level {user.level || 1} Agent</div>
                            <h2>{user.username}</h2>
                            
                            <div className="card-stats">
                                <div className="stat-item">
                                    <span className="label">Cyber Score</span>
                                    <span className="value">{user.score || 0}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">Total XP</span>
                                    <span className="value">{user.xp || 0}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">Region</span>
                                    <span className="value">{user.country || 'Global'}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">Status</span>
                                    <span className="value" style={{ color: '#00ffaa' }}>ACTIVE</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-footer">
                        <div className="card-uid">UID: {uid}</div>
                        <div className="card-barcode"></div>
                    </div>
                </div>
            </div>

            <div className="card-actions">
                <button className="scan-pdf-btn" onClick={exportToPDF} disabled={isScanning}>
                    {isScanning ? (
                        <>Integrating Data...</>
                    ) : (
                        <>
                            <Download size={16} /> Scan Digital Identity (PDF)
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AgentIDCard;
