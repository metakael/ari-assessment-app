// api/send-report.js
import { kv } from '@vercel/kv';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const PDF_BASE_URL = process.env.PDF_BASE_URL || 'https://sbtulpqgionwhhxt.public.blob.vercel-storage.com/'; 

export default async function handler(request, response) {
    console.log('=== SEND REPORT FUNCTION CALLED ===');
    console.log('Method:', request.method);
    console.log('Body:', JSON.stringify(request.body, null, 2));
    
    if (request.method !== 'POST') {
        return response.status(405).json({ 
            error: 'Method Not Allowed',
            method: request.method 
        });
    }

    try {
        const { firstName, email, archetype, domainScores, archetypeScores, sessionId, completedAt, primaryDomain } = request.body;

        console.log('=== VALIDATION ===');
        console.log('firstName:', firstName);
        console.log('email:', email);
        console.log('archetype:', archetype);

        // Basic validation
        if (!firstName || !email || !archetype) {
            return response.status(400).json({ 
                error: 'Missing required fields: firstName, email, and archetype are required.',
                received: { firstName, email, archetype }
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return response.status(400).json({ 
                error: 'Please enter a valid email address.',
                email: email
            });
        }

        console.log('=== ENVIRONMENT CHECK ===');
        console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
        
        if (!process.env.RESEND_API_KEY) {
            return response.status(500).json({ 
                error: 'Email service not configured - RESEND_API_KEY missing'
            });
        }

        // Save data to KV store
        console.log('=== SAVING DATA ===');
        try {
            const submissionKey = `submission:${sessionId || Date.now()}`;
            const userData = {
                firstName, email, archetype, primaryDomain,
                domainScores: domainScores || {},
                archetypeScores: archetypeScores || {},
                sessionId, completedAt: completedAt || new Date().toISOString(),
                emailSentAt: new Date().toISOString(),
                totalDomainPoints: domainScores ? Object.values(domainScores).reduce((sum, score) => sum + score, 0) : 0
            };
            await kv.set(submissionKey, userData);
            console.log('✅ Data saved successfully');
        } catch (kvError) {
            console.log('⚠️ KV save failed, continuing with email:', kvError.message);
        }

        // Prepare email
        const pdfUrl = `${PDF_BASE_URL}${archetype.toLowerCase()}.pdf`;
        const archetypeTitle = archetype.charAt(0).toUpperCase() + archetype.slice(1);
        
        console.log('=== EMAIL PREPARATION ===');
        console.log('PDF URL:', pdfUrl);
        console.log('Recipient:', email);

        // Send email
        const emailData = {
            from: 'Team Impact ARI <onboarding@resend.dev>',
            to: [email],
            subject: `Your Team Impact ARI Profile: The ${archetypeTitle}`,
            html: `
                <h1>Hello ${firstName},</h1>
                <p>Thank you for completing the Team Impact Archetype Resonance Index. Your results have identified you as the <strong>${archetypeTitle}</strong>.</p>
                <p>You can download your complete PDF profile here:</p>
                <p><a href="${pdfUrl}" style="background-color: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Download Your ${archetypeTitle} Profile PDF</a></p>
                <p>We hope this provides valuable insight into your natural strengths and contributions.</p>
                <br/>
                <p><em>The Team Impact ARI Team</em></p>
            `
        };

        console.log('=== SENDING EMAIL ===');
        const { data, error } = await resend.emails.send(emailData);

        if (error) {
            console.error('❌ Resend error:', JSON.stringify(error, null, 2));
            return response.status(400).json({ 
                error: `Email sending failed: ${error.message || 'Unknown error'}`,
                details: error
            });
        }

        console.log('✅ Email sent successfully:', data);
        return response.status(200).json({ 
            success: true,
            message: 'Your profile request has been received and the email has been sent.',
            emailId: data?.id
        });

    } catch (error) {
        console.error('❌ Critical error:', error);
        return response.status(500).json({ 
            error: 'An internal error occurred while processing your request.',
            details: error.message
        });
    }
}