const titles = [
    {
        id: 'junior-analyst',
        name: 'Junior Analyst',
        requirement: 'Reach Level 2',
        condition: (state) => state.level >= 2
    },
    {
        id: 'threat-hunter',
        name: 'Threat Hunter',
        requirement: 'Complete 5 Phishing scenarios',
        condition: (state) => {
            const phishing = state.completedScenarios.filter(s => s.category === 'Phishing');
            return phishing.length >= 5;
        }
    },
    {
        id: 'mfa-master',
        name: 'MFA Master',
        requirement: '100% Accuracy on 3 Phishing scenarios',
        condition: (state) => {
            const perfectPhishing = state.completedScenarios.filter(s => s.category === 'Phishing' && s.accuracy === 100);
            return perfectPhishing.length >= 3;
        }
    },
    {
        id: 'secure-architect',
        name: 'Secure Architect',
        requirement: 'Reach Level 10',
        condition: (state) => state.level >= 10
    },
    {
        id: 'zero-day-analyst',
        name: 'Zero-Day Analyst',
        requirement: 'Earn 10 Badges',
        condition: (state) => state.badges.length >= 10
    }
];

export default titles;
