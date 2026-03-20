/**
 * Seasonal Ranking Tiers Logic
 * Thresholds based on Cyber Score
 */

export const TIERS = {
    BRONZE: { name: 'Bronze', color: '#8b949e', min: 0, class: 'tier-bronze' },
    SILVER: { name: 'Silver', color: '#d1d5db', min: 500, class: 'tier-silver' },
    GOLD: { name: 'Gold', color: '#ffd700', min: 1000, class: 'tier-gold' },
    PLATINUM: { name: 'Platinum', color: '#00f0ff', min: 2000, class: 'tier-platinum' },
    DIAMOND: { name: 'Diamond', color: '#7c4dff', min: 3500, class: 'tier-diamond' },
    ACE: { name: 'Ace', color: '#ff4757', min: 5000, class: 'tier-ace' },
    CONQUEROR: { name: 'Conqueror', color: '#ffbd2e', min: 7500, class: 'tier-conqueror' }
};

export const getTier = (score) => {
    if (score >= TIERS.CONQUEROR.min) return TIERS.CONQUEROR;
    if (score >= TIERS.ACE.min) return TIERS.ACE;
    if (score >= TIERS.DIAMOND.min) return TIERS.DIAMOND;
    if (score >= TIERS.PLATINUM.min) return TIERS.PLATINUM;
    if (score >= TIERS.GOLD.min) return TIERS.GOLD;
    if (score >= TIERS.SILVER.min) return TIERS.SILVER;
    return TIERS.BRONZE;
};
