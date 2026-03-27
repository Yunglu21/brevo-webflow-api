export default async function handler(req, res) {
    // ✅ CORS erlauben
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // ✅ Preflight (CORS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ❌ Nur POST erlauben
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // ✅ Body sicher parsen
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        const { email, attributes, listIds } = body || {};

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // 🔗 Request an Brevo
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

        // 🔄 Response sicher verarbeiten
        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = { message: 'No JSON response from Brevo' };
        }

        // ❌ Fehler von Brevo weitergeben
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        // ✅ Erfolg
        return res.status(200).json({
            success: true
        });

    } catch (error) {
        console.error('Server error:', error);

        return res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
}
