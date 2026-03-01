import { Shield, Search, PhoneOff, Bug, Users, Star, Award, TrendingUp, Crown, Zap, Lock } from 'lucide-react';
import './Badge.css';

const iconMap = {
    Shield, Search, PhoneOff, Bug, Users, Star, Award, TrendingUp, Crown, Zap
};

export default function Badge({ badge, earned }) {
    const Icon = iconMap[badge.icon] || Shield;

    return (
        <div className={`badge-item ${earned ? 'earned' : 'locked'}`}>
            <div className={`badge-icon ${earned ? 'earned' : 'locked'}`}>
                {earned ? <Icon size={28} /> : <Lock size={24} />}
            </div>
            <div className="badge-name">{badge.name}</div>
            <div className="badge-desc">{badge.description}</div>
            {earned ? (
                <span className="badge-earned-tag">Earned ✓</span>
            ) : (
                <span className="badge-locked-tag">Locked</span>
            )}
        </div>
    );
}
