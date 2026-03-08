import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { buildApiUrl } from '../utils/api';
import { Users, UserPlus, ShieldPlus, LogOut, Copy, Trophy, CheckCircle2, ArrowLeft, Shield, Play } from 'lucide-react';
import Loader from '../components/Loader';
import './Teams.css';

export default function Teams() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const { state } = useGame(); // using to re-sync profile if needed
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isCreating, setIsCreating] = useState(false);
    const [teamNameForm, setTeamNameForm] = useState('');
    const [inviteCodeForm, setInviteCodeForm] = useState('');

    const [copied, setCopied] = useState(false);
    const [managedMember, setManagedMember] = useState(null);

    useEffect(() => {
        fetchMyTeam();
    }, [user?.teamId]);

    const fetchMyTeam = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/teams/my-team'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                setTeam(data);
                if (!user.teamId) {
                    updateUser({ teamId: data._id });
                }
            } else {
                setTeam(null);
            }
        } catch (err) {
            console.error("Failed to load team:", err);
            setError("Could not load team data.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/teams/create'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: teamNameForm })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            updateUser({ teamId: data.team._id });
            await fetchMyTeam();
            setIsCreating(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleJoinTeam = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/teams/join'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ inviteCode: inviteCodeForm })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            updateUser({ teamId: data.team._id });
            await fetchMyTeam();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLeaveTeam = async () => {
        if (!window.confirm("Are you sure you want to leave this team?")) return;
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/teams/leave'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message);
            }

            updateUser({ teamId: null });
            setTeam(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const copyInviteCode = () => {
        navigator.clipboard.writeText(team.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRoleChange = async (targetUserId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/teams/promote'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ targetUserId, newRole })
            });
            if (res.ok) {
                await fetchMyTeam();
                setManagedMember(null);
            } else {
                const data = await res.json();
                alert(data.message || "Action failed");
            }
        } catch (err) {
            alert("Error updating member");
        }
    };

    const handleRemoveMember = async (targetUserId) => {
        if (!window.confirm("Are you sure you want to remove this member from the team?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/api/teams/remove'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ targetUserId })
            });
            if (res.ok) {
                await fetchMyTeam();
                setManagedMember(null);
            } else {
                const data = await res.json();
                alert(data.message || "Removal failed");
            }
        } catch (err) {
            alert("Error removing member");
        }
    };

    if (loading) return <div className="page-loader"><Loader /></div>;

    return (
        <div className="teams-page">
            <div className="page-top-nav">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>
            </div>
            <header className="teams-header">
                <div className="teams-title">
                    <Users size={32} />
                    <h1>Cyber Defense Teams</h1>
                </div>
                <p>Join forces with other agents. Contribute your XP to the Team Score and dominate the global leaderboards.</p>
            </header>

            {error && <div className="error-alert">{error}</div>}

            {!team ? (
                <div className="teams-setup-container">
                    <div className="team-card join-card">
                        <h2><UserPlus size={24} /> Join a Team</h2>
                        <p>Enter an invite code provided by a team owner to join their ranks.</p>
                        <form onSubmit={handleJoinTeam}>
                            <input
                                type="text"
                                placeholder="Enter Invite Code (e.g. A1B2C3)"
                                value={inviteCodeForm}
                                onChange={(e) => setInviteCodeForm(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-primary">Join</button>
                        </form>
                    </div>

                    <div className="team-or-divider">
                        <span>OR</span>
                    </div>

                    <div className="team-card create-card">
                        <h2><ShieldPlus size={24} /> Create a Team</h2>
                        {isCreating ? (
                            <form onSubmit={handleCreateTeam}>
                                <input
                                    type="text"
                                    placeholder="Enter Team Name"
                                    value={teamNameForm}
                                    onChange={(e) => setTeamNameForm(e.target.value)}
                                    maxLength={30}
                                    minLength={3}
                                    required
                                />
                                <div className="form-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Confirm</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <p>Start your own Cyber Defense Team and recruit up to 10 agents to fight alongside you.</p>
                                <button className="btn-primary" onClick={() => setIsCreating(true)}>Forge New Team</button>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="team-dashboard">
                    <div className="team-dash-header">
                        <div className="team-dash-info">
                            <h2>{team.name}</h2>
                            <div className="team-score-badge">
                                <Trophy size={16} /> Total Score: {team.totalScore.toLocaleString()}
                            </div>
                        </div>
                        <button className="btn btn-danger leave-btn" type="button" onClick={handleLeaveTeam}>
                            <LogOut size={16} /> Leave Team
                        </button>
                    </div>

                    <div className="team-stats-bar">
                        <div className="stat-pill">
                            <Users size={18} />
                            <div className="stat-val">
                                <span>{team.members.length} / 10</span>
                                <label>Deployed Agents</label>
                            </div>
                        </div>
                        <div className="stat-pill">
                            <Trophy size={18} />
                            <div className="stat-val">
                                <span>{Math.round(team.members.reduce((sum, m) => sum + m.level, 0) / team.members.length)}</span>
                                <label>Avg. Agent Level</label>
                            </div>
                        </div>
                        <div className="stat-pill">
                            <Shield size={18} />
                            <div className="stat-val">
                                <span>{team.totalScore.toLocaleString()}</span>
                                <label>Net Security Score</label>
                            </div>
                        </div>
                    </div>

                    <div className="team-warroom-prompt">
                        <div className="prompt-content">
                            <h3><Shield size={24} /> Active Operations</h3>
                            <p>Launch a collaborative War Room to analyze threats with your teammates in real-time.</p>
                        </div>
                        <button 
                            className="btn-primary" 
                            onClick={async () => {
                                try {
                                    const token = localStorage.getItem('token');
                                    const res = await fetch('/api/warrooms', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({
                                            name: `${team.name} Ops`,
                                            teamId: team._id,
                                            scenarioId: 'scen-01', // Example default
                                            scenarioType: 'core'
                                        })
                                    });
                                    const data = await res.json();
                                    if (res.ok) navigate(`/warroom/${data._id}`);
                                } catch (err) {
                                    alert('Error launching War Room');
                                }
                            }}
                        >
                            <Play size={18} /> Launch War Room
                        </button>
                    </div>

                    <div className="team-invite-code-card">
                        <h3>Team Invite Code</h3>
                        <p>Share this code with other agents so they can join <strong>{team.name}</strong> (Max 10 per team).</p>
                        <div className="code-box">
                            <span className="code">{team.inviteCode}</span>
                            <button className="btn-ghost" onClick={copyInviteCode}>
                                {copied ? <CheckCircle2 size={18} className="success-text" /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="team-roster">
                        <h3>Active Roster ({team.members.length}/10)</h3>
                        <div className="roster-grid">
                            {team.members.map(member => (
                                <div 
                                    key={member._id} 
                                    className={`roster-member ${member._id === user.id ? 'current-user' : ''} ${user.id === team.ownerId && member._id !== user.id ? 'manageable' : ''}`}
                                    onClick={() => {
                                        if (user.id === team.ownerId && member._id !== user.id) {
                                            setManagedMember(member);
                                        }
                                    }}
                                >
                                    <div className="member-avatar">
                                        {member.profilePhoto ? (
                                            <img src={member.profilePhoto} alt={member.username} />
                                        ) : (
                                            <div className="avatar-placeholder">{member.username.charAt(0).toUpperCase()}</div>
                                        )}
                                    </div>
                                    <div className="member-details">
                                        <div className="member-name-row">
                                            <h4>{member.username}</h4>
                                            {member._id === team.ownerId && <span className="role-badge owner">Owner</span>}
                                            {team.memberRoles?.find(r => r.userId.toString() === member._id.toString())?.role && (
                                                <span className={`role-badge ${(team.memberRoles.find(r => r.userId.toString() === member._id.toString()).role).toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {team.memberRoles.find(r => r.userId.toString() === member._id.toString()).role}
                                                </span>
                                            )}
                                        </div>
                                        <div className="member-stats">
                                            <span>Level {member.level}</span>
                                            <span>Score: {member.score.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Management Modal */}
                    {managedMember && (
                        <div className="mgmt-modal-overlay" onClick={() => setManagedMember(null)}>
                            <div className="mgmt-modal" onClick={e => e.stopPropagation()}>
                                <header>
                                    <h3>Manage {managedMember.username}</h3>
                                    <button className="close-btn" onClick={() => setManagedMember(null)}><LogOut size={16} /></button>
                                </header>
                                <div className="mgmt-options">
                                    <div className="mgmt-section">
                                        <label>Assign Role</label>
                                        <div className="role-buttons">
                                            {['Principal Investigator', 'Security Researcher', 'Threat Analyst', 'Technical Operative'].map(role => (
                                                <button 
                                                    key={role}
                                                    className={`role-btn ${team.memberRoles?.find(r => r.userId.toString() === managedMember._id.toString())?.role === role ? 'active' : ''}`}
                                                    onClick={() => handleRoleChange(managedMember._id, role)}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mgmt-divider"></div>
                                    <button className="btn-danger kick-btn" onClick={() => handleRemoveMember(managedMember._id)}>
                                        <LogOut size={16} /> Remove from Team
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
