// api/send-report.js
import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    // We only accept POST requests to this endpoint.
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { firstName, email, archetype, domainScores, archetypeScores, sessionId } = request.body;

        // --- Basic Validation ---
        if (!firstName || !email || !archetype || !domainScores || !archetypeScores) {
            return response.status(400).json({ error: 'Missing required fields.' });
        }
        
        // --- 1. Save User Data to Vercel KV ---
        // We'll create a unique key for each submission to avoid overwriting data.
        const submissionKey = `submission:${sessionId || email + '_' + Date.now()}`;
        
        const userData = {
            firstName,
            email,
            archetype,
            domainScores,
            archetypeScores,
            submittedAt: new Date().toISOString()
        };

        // Use kv.set to save the user's data.
        await kv.set(submissionKey, userData);
        console.log(`Successfully saved data for ${email} with key ${submissionKey}`);


        // --- 2. TODO: PDF and Email Logic ---
        // This is where the next steps will go.
        // a. Get a secure, temporary link for the correct PDF from Vercel Blob/S3.
        // b. Use the Resend API to send an email with that link.

        // For now, we just return a success message to confirm the API is working.
        return response.status(200).json({ message: 'Your profile request has been received.' });

    } catch (error) {
        console.error("API Error in send-report:", error);
        return response.status(500).json({ error: 'An internal error occurred.' });
    }
}
