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
        const { 
            firstName, 
            email, 
            archetype, 
            domainScores, 
            archetypeScores, 
            sessionId, 
            completedAt, 
            primaryDomain 
        } = request.body;

        // Basic validation
        if (!firstName || !email || !archetype) {
            return response.status(400).json({ error: 'Missing required fields: firstName, email, and archetype.' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return response.status(400).json({ error: 'Please enter a valid email address.' });
        }
        
        // Save comprehensive data for analysis
        const submissionKey = `submission:${sessionId || email + '_' + Date.now()}`;
        const userData = {
            // User info
            firstName, 
            email, 
            
            // Assessment results
            archetype, 
            primaryDomain,
            
            // Detailed scores for analysis
            domainScores: domainScores || {},
            archetypeScores: archetypeScores || {},
            
            // Metadata
            sessionId,
            completedAt: completedAt || new Date().toISOString(),
            emailSentAt: new Date().toISOString(),
            
            // Additional analysis data
            totalDomainPoints: domainScores ? Object.values(domainScores).reduce((sum, score) => sum + score, 0) : 0,
            domainRankings: domainScores ? Object.entries(domainScores).sort((a, b) => b[1] - a[1]).map(([domain, score]) => ({ domain, score })) : [],
            archetypeRankings: archetypeScores ? Object.entries(archetypeScores).sort((a, b) => b[1] - a[1]).map(([archetype, score]) => ({ archetype, score })) : []
        };
        
        await kv.set(submissionKey, userData);
        console.log(`Successfully saved comprehensive data for ${email}`);
        
        // Also save to a summary index for easier analysis
        const summaryKey = `summary:${Date.now()}_${sessionId}`;
        const summaryData = {
            email,
            archetype,
            primaryDomain,
            completedAt: completedAt || new Date().toISOString(),
            totalDomainPoints: userData.totalDomainPoints,
            topDomain: userData.domainRankings[0]?.domain || primaryDomain,
            topDomainScore: userData.domainRankings[0]?.score || 0
        };
        await kv.set(summaryKey, summaryData);

        // Construct PDF URL
        const pdfUrl = `${PDF_BASE_URL}${archetype.toLowerCase()}.pdf`;
        const archetypeTitle = archetype.charAt(0).toUpperCase() + archetype.slice(1);

        // Send email
        const { data, error } = await resend.emails.send({
            from: 'Team Impact ARI <reports@teamimpact.app>', 
            to: [email],
            subject: `Your Team Impact ARI Profile: The ${archetypeTitle}`,
            html: `
                <h1>Hello ${firstName},</h1>
                <p>Thank you for completing the Team Impact Archetype Resonance Index. Your results have identified you as the <strong>${archetypeTitle}</strong>.</p>
                <p>You can download your complete, one-page PDF profile using the link below:</p>
                <p><a href="${pdfUrl}" style="background-color: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Download Your ${archetypeTitle} Profile PDF</a></p>
                <p>We hope this provides valuable insight into your natural strengths and contributions.</p>
                <br/>
                <p><em>The Team Impact ARI Team</em></p>
            `
        });

        if (error) {
            console.error("Resend API Error:", error);
            return response.status(400).json({ error: error.message || 'Failed to send email' });
        }

        console.log("Email sent successfully:", data);
        console.log("Data saved for analysis:", { 
            email, 
            archetype, 
            primaryDomain,
            domainScoresCount: Object.keys(domainScores || {}).length,
            archetypeScoresCount: Object.keys(archetypeScores || {}).length
        });

        return response.status(200).json({ 
            message: 'Your profile request has been received and the email has been sent.' 
        });

    } catch (error) {
        console.error("API Error in send-report:", error);
        return response.status(500).json({ error: 'An internal error occurred while processing your request.' });
    }
}