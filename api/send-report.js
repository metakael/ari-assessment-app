// api/send-report.js
import { kv } from '@vercel/kv';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const PDF_BASE_URL = process.env.PDF_BASE_URL || 'https://sbtulpqgionwhhxt.public.blob.vercel-storage.com/'; 

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { firstName, email, archetype, domainScores, archetypeScores, sessionId } = request.body;

        if (!firstName || !email || !archetype || !domainScores || !archetypeScores) {
            return response.status(400).json({ error: 'Missing required fields.' });
        }
        
        const submissionKey = `submission:${sessionId || email + '_' + Date.now()}`;
        const userData = {
            firstName, email, archetype, domainScores, archetypeScores,
            submittedAt: new Date().toISOString()
        };
        await kv.set(submissionKey, userData);
        console.log(`Successfully saved data for ${email}`);

        const pdfUrl = `${PDF_BASE_URL}/${archetype.toLowerCase()}.pdf`;
        const archetypeTitle = archetype.charAt(0).toUpperCase() + archetype.slice(1);

        const { data, error } = await resend.emails.send({
            from: 'Team Impact ARI <reports@teamimpact.app>', 
            to: [email],
            subject: `Your Team Impact ARI Profile: The ${archetypeTitle}`,
            html: `<h1>Hello ${firstName},</h1><p>Thank you for completing the Team Impact Archetype Resonance Index. Your results have identified you as the <strong>${archetypeTitle}</strong>.</p><p>You can download your complete, one-page PDF profile using the link below:</p><p><a href="${pdfUrl}">Download Your ${archetypeTitle} Profile PDF</a></p><p>We hope this provides valuable insight into your natural strengths and contributions.</p><br/><p><em>The Team Impact ARI Team</em></p>`
        });

        if (error) {
            console.error("Resend API Error:", error);
            return response.status(400).json(error);
        }

        console.log("Email sent successfully:", data);
        return response.status(200).json({ message: 'Your profile request has been received and the email has been sent.' });

    } catch (error) {
        console.error("API Error in send-report:", error);
        return response.status(500).json({ error: 'An internal error occurred.' });
    }
}