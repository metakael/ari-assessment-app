// api/send-report.js - Debug Version
import { kv } from '@vercel/kv';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const PDF_BASE_URL = process.env.PDF_BASE_URL || 'https://sbtulpqgionwhhxt.public.blob.vercel-storage.com/'; 

export default async function handler(request, response) {
    console.log('=== SEND REPORT DEBUG START ===');
    console.log('Request method:', request.method);
    console.log('Request body:', JSON.stringify(request.body, null, 2));
    
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

        console.log('=== VALIDATION START ===');
        console.log('firstName:', firstName);
        console.log('email:', email);
        console.log('archetype:', archetype);
        console.log('primaryDomain:', primaryDomain);

        // Basic validation
        if (!firstName || !email || !archetype) {
            console.log('❌ Missing required fields');
            return response.status(400).json({ error: 'Missing required fields: firstName, email, and archetype.' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Invalid email format:', email);
            return response.status(400).json({ error: 'Please enter a valid email address.' });
        }
        
        console.log('✅ Validation passed');

        // Check environment variables
        console.log('=== ENVIRONMENT CHECK ===');
        console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
        console.log('RESEND_API_KEY preview:', process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 10) + '...' : 'NOT SET');
        console.log('PDF_BASE_URL:', PDF_BASE_URL);

        if (!process.env.RESEND_API_KEY) {
            console.log('❌ RESEND_API_KEY not set');
            return response.status(500).json({ error: 'Email service not configured' });
        }

        // Save comprehensive data for analysis
        console.log('=== DATA STORAGE START ===');
        const submissionKey = `submission:${sessionId || email + '_' + Date.now()}`;
        const userData = {
            firstName, 
            email, 
            archetype, 
            primaryDomain,
            domainScores: domainScores || {},
            archetypeScores: archetypeScores || {},
            sessionId,
            completedAt: completedAt || new Date().toISOString(),
            emailSentAt: new Date().toISOString(),
            totalDomainPoints: domainScores ? Object.values(domainScores).reduce((sum, score) => sum + score, 0) : 0,
            domainRankings: domainScores ? Object.entries(domainScores).sort((a, b) => b[1] - a[1]).map(([domain, score]) => ({ domain, score })) : [],
            archetypeRankings: archetypeScores ? Object.entries(archetypeScores).sort((a, b) => b[1] - a[1]).map(([archetype, score]) => ({ archetype, score })) : []
        };
        
        try {
            await kv.set(submissionKey, userData);
            console.log('✅ Data saved successfully');
        } catch (kvError) {
            console.log('❌ KV Storage error:', kvError);
            // Continue anyway - don't fail the email send
        }

        // Construct PDF URL
        const pdfUrl = `${PDF_BASE_URL}${archetype.toLowerCase()}.pdf`;
        const archetypeTitle = archetype.charAt(0).toUpperCase() + archetype.slice(1);
        
        console.log('=== EMAIL PREPARATION ===');
        console.log('PDF URL:', pdfUrl);
        console.log('Archetype title:', archetypeTitle);
        console.log('Recipient email:', email);

        // Prepare email data
        const emailData = {
            from: 'Team Impact ARI <onboarding@resend.dev>', 
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
        };

        console.log('Email data prepared:', {
            from: emailData.from,
            to: emailData.to,
            subject: emailData.subject,
            htmlLength: emailData.html.length
        });

        // Send email with detailed error logging
        console.log('=== SENDING EMAIL ===');
        const { data, error } = await resend.emails.send(emailData);

        if (error) {
            console.log('❌ Resend API Error Details:');
            console.log('Error object:', JSON.stringify(error, null, 2));
            console.log('Error message:', error.message);
            console.log('Error name:', error.name);
            
            // Check for common issues
            if (error.message && error.message.includes('pattern')) {
                console.log('🔍 Pattern error detected - likely email format issue');
                console.log('From address:', emailData.from);
                console.log('To address:', emailData.to);
                
                // Try to identify the specific issue
                if (emailData.from.includes('@teamimpact.app')) {
                    console.log('⚠️  Domain @teamimpact.app may not be verified in Resend');
                }
            }
            
            return response.status(400).json({ 
                error: `Email sending failed: ${error.message || 'Unknown error'}`,
                details: error
            });
        }

        console.log('✅ Email sent successfully');
        console.log('Email response data:', data);

        // Save summary data
        try {
            const summaryKey = `summary:${Date.now()}_${sessionId}`;
            const summaryData = {
                email,
                archetype,
                primaryDomain,
                completedAt: completedAt || new Date().toISOString(),
                totalDomainPoints: userData.totalDomainPoints
            };
            await kv.set(summaryKey, summaryData);
            console.log('✅ Summary data saved');
        } catch (summaryError) {
            console.log('❌ Summary save error:', summaryError);
        }

        console.log('=== SEND REPORT DEBUG END ===');
        return response.status(200).json({ 
            message: 'Your profile request has been received and the email has been sent.',
            debug: {
                emailSent: true,
                pdfUrl: pdfUrl,
                recipientEmail: email
            }
        });

    } catch (error) {
        console.log('❌ CRITICAL ERROR');
        console.log('Error message:', error.message);
        console.log('Error stack:', error.stack);
        console.log('Error name:', error.name);
        
        return response.status(500).json({ 
            error: 'An internal error occurred while processing your request.',
            details: error.message
        });
    }
}