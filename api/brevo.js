export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        console.log("Incoming request:", req.body);

        const { email, attributes = {}, listIds = [], type } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // 🔧 List IDs sauber parsen (fix für String/Array)
        const parsedListIds = Array.isArray(listIds)
            ? listIds
            : (listIds || [])
                .toString()
                .split(',')
                .map(id => parseInt(id.trim()))
                .filter(id => !isNaN(id));

        console.log("Parsed List IDs:", parsedListIds);

        // ✅ NEWSLETTER → DOUBLE OPT-IN
        if (type === "newsletter") {

            console.log("Newsletter DOI triggered");

            const payload = {
                email: email,
                includeListIds: parsedListIds,
                templateId: 8,
                redirectionUrl: "https://www.maison-acme.com/thank-you"
            };

            console.log("DOI Payload:", payload);

            const response = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.BREVO_API_KEY
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            console.log("Brevo DOI response:", data);

            if (!response.ok) {
                console.error('DOI Error:', data);
                return res.status(400).json(data);
            }

            return res.status(200).json({ success: true });
        }

        // ✅ EVENTS → WIE BISHER
        console.log("Event flow triggered");

        const payload = {
            email: email,
            attributes: attributes,
            listIds: parsedListIds,
            updateEnabled: true
        };

        console.log("Event Payload:", payload);

        const response = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.BREVO_API_KEY
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        console.log("Brevo Event response:", data);

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
