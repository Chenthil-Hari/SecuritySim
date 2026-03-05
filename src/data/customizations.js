const customizations = {
    banners: [
        {
            id: 'default',
            name: 'Cyber Grid',
            previewColor: '#00f0ff',
            style: { background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(0, 0, 0, 0) 100%)' }
        },
        {
            id: 'neon-night',
            name: 'Neon Night',
            previewColor: '#ff00ff',
            requirement: 'Reach Level 5',
            condition: (state) => state.level >= 5,
            style: { background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.15) 0%, rgba(10, 10, 30, 0.9) 100%)', borderBottom: '2px solid #ff00ff' }
        },
        {
            id: 'deep-space',
            name: 'Deep Space',
            previewColor: '#7c4dff',
            requirement: 'Earn 5 Badges',
            condition: (state) => state.badges?.length >= 5,
            style: { background: 'radial-gradient(circle at top right, rgba(124, 77, 255, 0.2), transparent), #050510' }
        },
        {
            id: 'matrix-elite',
            name: 'Matrix Core',
            previewColor: '#00ff00',
            requirement: 'Top 10 Rank',
            style: { background: 'linear-gradient(180deg, rgba(0, 255, 0, 0.1) 0%, transparent 100%)', borderBottom: '1px solid #00ff00' }
        },
        {
            id: 'gold-champion',
            name: 'Gold Champion',
            previewColor: '#ffd700',
            requirement: 'Rank #1 Overall',
            style: { background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.15) 0%, transparent 100%)', borderBottom: '2px solid #ffd700' }
        }
    ],
    auras: {
        rank1: { color: '#ffd700', label: 'Gold Aura', blur: '20px' },
        top10: { color: '#bd00ff', label: 'Purple Pulse', blur: '15px' },
        top50: { color: '#00f0ff', label: 'Cyber Cyan', blur: '10px' },
        default: { color: 'transparent', label: 'None', blur: '0px' }
    }
};

export default customizations;
