const badges = [
    {
        id: 'first-step',
        name: 'First Step',
        description: 'Complete your first scenario',
        icon: 'Shield',
        condition: (state) => state.completedScenarios.length >= 1
    },
    {
        id: 'phishing-detective',
        name: 'Phishing Detective',
        description: 'Correctly identify 3 phishing attempts',
        icon: 'Search',
        condition: (state) => {
            const phishing = state.completedScenarios.filter(s => s.category === 'Phishing' && s.accuracy >= 80);
            return phishing.length >= 3;
        }
    },
    {
        id: 'scam-buster',
        name: 'Scam Buster',
        description: 'Successfully handle 2 scam call scenarios',
        icon: 'PhoneOff',
        condition: (state) => {
            const scams = state.completedScenarios.filter(s => s.category === 'Scam Calls' && s.accuracy >= 80);
            return scams.length >= 2;
        }
    },
    {
        id: 'malware-crusher',
        name: 'Malware Crusher',
        description: 'Defeat 2 malware attack scenarios',
        icon: 'Bug',
        condition: (state) => {
            const malware = state.completedScenarios.filter(s => s.category === 'Malware' && s.accuracy >= 80);
            return malware.length >= 2;
        }
    },
    {
        id: 'social-sentinel',
        name: 'Social Sentinel',
        description: 'Resist 3 social engineering attacks',
        icon: 'Users',
        condition: (state) => {
            const social = state.completedScenarios.filter(s => s.category === 'Social Engineering' && s.accuracy >= 80);
            return social.length >= 3;
        }
    },
    {
        id: 'perfect-score',
        name: 'Perfect Score',
        description: 'Get 100% accuracy on any scenario',
        icon: 'Star',
        condition: (state) => state.completedScenarios.some(s => s.accuracy === 100)
    },
    {
        id: 'cyber-veteran',
        name: 'Cyber Veteran',
        description: 'Complete 5 scenarios',
        icon: 'Award',
        condition: (state) => state.completedScenarios.length >= 5
    },
    {
        id: 'level-5',
        name: 'Rising Star',
        description: 'Reach Level 5',
        icon: 'TrendingUp',
        condition: (state) => state.level >= 5
    },
    {
        id: 'cyber-master',
        name: 'Cyber Master',
        description: 'Complete all scenarios with 80%+ accuracy',
        icon: 'Crown',
        condition: (state) => {
            return state.completedScenarios.length >= 10 &&
                state.completedScenarios.every(s => s.accuracy >= 80);
        }
    },
    {
        id: 'quick-learner',
        name: 'Quick Learner',
        description: 'Reach Cyber Safety Score of 70+',
        icon: 'Zap',
        condition: (state) => state.score >= 70
    }
];

export default badges;
