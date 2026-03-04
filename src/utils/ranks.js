const ranks = [
    { minLevel: 1, title: 'Trainee', icon: '🔰', color: '#9898b8', short: 'Trainee' },
    { minLevel: 2, title: 'Analyst', icon: '🛡️', color: '#00f0ff', short: 'Analyst' },
    { minLevel: 4, title: 'Specialist', icon: '⚡', color: '#a855f7', short: 'Specialist' },
    { minLevel: 6, title: 'Expert', icon: '🔥', color: '#f59e0b', short: 'Expert' },
    { minLevel: 8, title: 'Commander', icon: '💎', color: '#3b82f6', short: 'Commander' },
    { minLevel: 10, title: 'Chief Security Officer', icon: '👑', color: '#ffd700', short: 'CSO' },
];

export function getRank(level) {
    for (let i = ranks.length - 1; i >= 0; i--) {
        if (level >= ranks[i].minLevel) return ranks[i];
    }
    return ranks[0];
}

export default ranks;
