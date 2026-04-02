export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email, attributes = {}, listIds = [], type } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // ✅ NEWSLETTER → DOUBLE OPT-IN
        if (type === "newsletter") {

            const payload = {
                email: email,
                includeListIds: listIds,
                templateId: 8,
                redirectionUrl: "https://www.maison-acme.com/thank-you"
            };

            const response = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.BREVO_API_KEY
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('DOI Error:', data);
                return res.status(400).json(data);
            }

            return res.status(200).json({ success: true });
        }

        // ✅ EVENTS → WIE BISHER
        const payload = {
            email: email,
            attributes: attributes,
            listIds: listIds,
            updateEnabled: true
        };

        const response = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.BREVO_API_KEY
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Event Error:', data);
            return res.status(400).json(data);
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
