import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { buildApiUrl } from '../utils/api';
import { Users, UserPlus, ShieldPlus, LogOut, Copy, Trophy, CheckCircle2 } from 'lucide-react';
import Loader from '../components/Loader';
import './Teams.css';

export default function Teams() {
    const { user, updateUser } = useAuth();
    const { state } = useGame(); // using to re-sync profile if needed
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isCreating, setIsCreating] = useState(false);
    const [teamNameForm, setTeamNameForm] = useState('');
    const [inviteCodeForm, setInviteCodeForm] = useState('');

    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchMyTeam();
    }, [user?.teamId]);

    const fetchMyTeam = async () => {
        if (!user || (!user.teamId && !team)) {
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
                headers: { 'Authorization': `Bearer ${token}` }
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

    if (loading) return <div className="page-loader"><Loader /></div>;

    return (
        <div className="teams-page">
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
                        <button className="btn-danger leave-btn" onClick={handleLeaveTeam}>
                            <LogOut size={16} /> Leave Team
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
                                <div key={member._id} className={`roster-member ${member._id === user.id ? 'current-user' : ''}`}>
                                    <div className="member-avatar">
                                        {member.profilePhoto ? (
                                            <img src={member.profilePhoto} alt={member.username} />
                                        ) : (
                                            <div className="avatar-placeholder">{member.username.charAt(0).toUpperCase()}</div>
                                        )}
                                    </div>
                                    <div className="member-details">
                                        <h4>{member.username} {member._id === team.ownerId && <span className="owner-badge">Owner</span>}</h4>
                                        <div className="member-stats">
                                            <span>Level {member.level}</span>
                                            <span>Score: {member.score.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
