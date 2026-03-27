export default async function handler(req, res) {
    // ✅ CORS Headers setzen
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // ✅ Preflight Request behandeln
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Nur POST erlauben
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        const { email, attributes, listIds } = body || {};

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const response = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.BREVO_API_KEY
            },
            body: JSON.stringify({
                email,
                attributes,
                listIds,
                updateEnabled: true
            })
        });

        const data = await response.json();

        return res.status(200).json(data);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
}
