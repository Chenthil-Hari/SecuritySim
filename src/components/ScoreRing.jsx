import './ScoreRing.css';

export default function ScoreRing({ score = 0, size = 180, strokeWidth = 10, label = 'Safety Score', className = '' }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = () => {
        if (score >= 80) return 'var(--success)';
        if (score >= 60) return 'var(--primary)';
        if (score >= 40) return 'var(--warning)';
        return 'var(--danger)';
    };

    return (
        <div className={`score-ring-container ${className}`}>
            <div className="score-ring" style={{ width: size, height: size }}>
                <svg width={size} height={size}>
                    <circle
                        className="score-ring-bg"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        className="score-ring-progress"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ stroke: getColor() }}
                    />
                </svg>
                <div className="score-ring-value">
                    <span className="score-ring-number" style={{ color: getColor() }}>{score}</span>
                    <span className="score-ring-label">{label}</span>
                </div>
            </div>
        </div>
    );
}
