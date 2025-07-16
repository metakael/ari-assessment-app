// api/send-report.js
import { kv } from '@vercel/kv';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to create temporary download token
async function createTempDownload(archetype, firstName, email, sessionId) {
    const token = crypto.randomBytes(32).toString('hex');
    
    const downloadInfo = {
        archetype: archetype.toLowerCase(),
        firstName,
        email,
        sessionId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        downloaded: false
    };
    
    // Store in KV with 24 hour expiration (86400 seconds)
    await kv.set(`download:${token}`, downloadInfo, { ex: 86400 });
    
    console.log('✅ Temporary download token created:', token);
    return token;
}

export default async function handler(request, response) {
    console.log('=== SEND REPORT FUNCTION CALLED ===');
    console.log('Method:', request.method);
    
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
        if (!process.env.RESEND_API_KEY) {
            return response.status(500).json({ 
                error: 'Email service not configured - RESEND_API_KEY missing'
            });
        }

        // Create temporary download token FIRST
        console.log('=== CREATING TEMPORARY DOWNLOAD TOKEN ===');
        let downloadToken;
        try {
            downloadToken = await createTempDownload(archetype, firstName, email, sessionId);
        } catch (tokenError) {
            console.error('❌ Failed to create download token:', tokenError);
            return response.status(500).json({ 
                error: 'Failed to generate secure download link. Please try again.'
            });
        }

        // Save comprehensive data to KV store
        console.log('=== SAVING USER DATA ===');
        try {
            const submissionKey = `submission:${sessionId || Date.now()}`;
            const userData = {
                firstName, email, archetype, primaryDomain,
                domainScores: domainScores || {},
                archetypeScores: archetypeScores || {},
                sessionId, 
                completedAt: completedAt || new Date().toISOString(),
                emailSentAt: new Date().toISOString(),
                downloadToken, // Store the token for reference
                totalDomainPoints: domainScores ? Object.values(domainScores).reduce((sum, score) => sum + score, 0) : 0,
                domainRankings: domainScores ? Object.entries(domainScores).sort((a, b) => b[1] - a[1]).map(([domain, score]) => ({ domain, score })) : [],
                archetypeRankings: archetypeScores ? Object.entries(archetypeScores).sort((a, b) => b[1] - a[1]).map(([archetype, score]) => ({ archetype, score })) : []
            };
            await kv.set(submissionKey, userData);
            console.log('✅ User data saved successfully');
        } catch (kvError) {
            console.log('⚠️ User data save failed:', kvError.message);
            // Continue with email even if data save fails
        }

        // Create the temporary download URL
        const baseUrl = request.headers.host ? `https://${request.headers.host}` : 'https://ari-assessment-app-ii.vercel.app';
        const downloadUrl = `${baseUrl}/api/temp-download?token=${downloadToken}`;
        
        const archetypeTitle = archetype.charAt(0).toUpperCase() + archetype.slice(1);
        
        console.log('=== EMAIL PREPARATION ===');
        console.log('Temporary download URL created');
        console.log('Recipient:', email);

        // Send email with temporary download link
        const emailData = {
            from: 'Team Impact ARI <reports@teamimpact.app>', // Update this to your verified domain
            to: [email],
            subject: `Your Team Impact ARI Profile: The ${archetypeTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #1f2937; text-align: center;">Hello ${firstName}! 👋</h1>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="color: #374151; margin-top: 0;">🎉 Your Assessment Results Are Ready!</h2>
                        <p style="font-size: 16px; color: #4b5563;">
                            Thank you for completing the Team Impact Archetype Resonance Index. 
                            Your results have identified you as <strong style="color: #0891b2;">The ${archetypeTitle}</strong>.
                        </p>
                    </div>
                    
                    <p style="font-size: 16px; color: #374151;">
                        Click the secure button below to download your complete one-page PDF profile:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${downloadUrl}" 
                           style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
                                  color: white; 
                                  padding: 16px 32px; 
                                  text-decoration: none; 
                                  border-radius: 12px; 
                                  display: inline-block; 
                                  font-weight: bold;
                                  font-size: 16px;
                                  box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
                                  transition: all 0.3s ease;">
                            📄 Download Your ${archetypeTitle} Profile
                        </a>
                    </div>
                    
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                        <h3 style="color: #92400e; margin-top: 0; font-size: 14px;">⏰ Important: Time-Limited Access</h3>
                        <p style="color: #92400e; margin-bottom: 0; font-size: 14px;">
                            This secure download link will expire in <strong>24 hours</strong> for your security. 
                            Please download your profile soon!
                        </p>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px;">
                        We hope this provides valuable insight into your natural strengths and contributions to teams.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="color: #9ca3af; font-size: 13px; text-align: center;">
                        Best regards,<br/>
                        <strong>The Team Impact ARI Team</strong><br/>
                        <em>Discover your team superpowers</em>
                    </p>
                    
                    <p style="color: #d1d5db; font-size: 11px; text-align: center; margin-top: 20px;">
                        This email was sent because you completed our assessment. 
                        The download link is unique and secure.
                    </p>
                </div>
            `
        };

        console.log('=== SENDING EMAIL ===');
        const { data, error } = await resend.emails.send(emailData);

        if (error) {
            console.error('❌ Resend error:', JSON.stringify(error, null, 2));
            
            // Clean up the download token if email fails
            try {
                await kv.del(`download:${downloadToken}`);
                console.log('🧹 Cleaned up download token due to email failure');
            } catch (cleanupError) {
                console.log('Failed to cleanup token:', cleanupError.message);
            }
            
            return response.status(400).json({ 
                error: `Email sending failed: ${error.message || 'Unknown error'}`,
                details: error
            });
        }

        // Update the submission record with email success
        try {
            const submissionKey = `submission:${sessionId || Date.now()}`;
            const existingData = await kv.get(submissionKey);
            if (existingData) {
                existingData.emailSent = true;
                existingData.emailId = data?.id;
                existingData.emailSentSuccessfully = new Date().toISOString();
                await kv.set(submissionKey, existingData);
            }
        } catch (updateError) {
            console.log('Failed to update email success status:', updateError.message);
        }

        console.log('✅ Email sent successfully with temporary download link');
        console.log('Email ID:', data?.id);
        
        return response.status(200).json({ 
            success: true,
            message: 'Your profile request has been received and the email has been sent with a secure 24-hour download link.',
            emailId: data?.id,
            expiresIn: '24 hours'
        });

    } catch (error) {
        console.error('❌ Critical error:', error);
        return response.status(500).json({ 
            error: 'An internal error occurred while processing your request.',
            details: error.message
        });
    }
}