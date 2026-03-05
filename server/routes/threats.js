import express from 'express';

const router = express.Router();

const OTX_API_KEY = 'bd991e8391149e4abc85d266d993c72eaca9b7f9cf6096f4e82fa5a853fa3f63';
const OTX_URL = 'https://otx.alienvault.com/api/v1/pulses/subscribed?limit=20';

router.get('/live', async (req, res) => {
    try {
        const response = await fetch(OTX_URL, {
            headers: {
                'X-OTX-API-KEY': OTX_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`OTX API responded with ${response.status}`);
        }

        const data = await response.json();

        // Transform OTX Pulses into our Map format
        const threats = data.results.map(pulse => ({
            id: pulse.id,
            type: pulse.name,
            severity: pulse.adversary || 'Active Threat',
            description: pulse.description,
            tags: pulse.tags,
            timestamp: pulse.modified,
            indicators: pulse.indicators_count,
            source: 'OTX-Intel'
        }));

        res.json(threats);
    } catch (error) {
        console.error('Error fetching OTX threats:', error);
        res.status(500).json({ message: 'Error fetching real-time threat data', error: error.message });
    }
});

export default router;
