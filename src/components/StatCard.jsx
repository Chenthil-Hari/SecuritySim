import './StatCard.css';

export default function StatCard({ icon: Icon, label, value, sub, color = 'cyan' }) {
    return (
        <div className="stat-card">
            <div className={`stat-card-icon ${color}`}>
                <Icon size={24} />
            </div>
            <div className="stat-card-info">
                <div className="stat-card-label">{label}</div>
                <div className="stat-card-value">{value}</div>
                {sub && <div className="stat-card-sub">{sub}</div>}
            </div>
        </div>
    );
}
