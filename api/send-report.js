// api/send-report.js
// This function will handle the "Get Full Profile" form submission.

export default async function handler(request, response) {
    // We only accept POST requests to this endpoint.
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { firstName, email, archetype } = request.body;

        // --- Basic Validation ---
        if (!firstName || !email || !archetype) {
            return response.status(400).json({ error: 'Missing required fields.' });
        }
        
        // --- TODO: Resend Email Logic will go here ---
        // In the next step, we will add code here to:
        // 1. Get a secure, temporary link for the correct PDF from Vercel Blob.
        // 2. Use the Resend API to send an email with that link.

        // For now, we just return a success message to confirm the API is working.
        console.log(`Received request to send '${archetype}' profile to ${email}`);
        
        return response.status(200).json({ message: 'Request received successfully. Email sending will be implemented next.' });

    } catch (error) {
        console.error("API Error in send-report:", error);
        return response.status(500).json({ error: 'An internal error occurred.' });
    }
}