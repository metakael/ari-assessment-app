// api/temp-download.js
import { kv } from '@vercel/kv';

const PDF_BASE_URL = process.env.PDF_BASE_URL || 'https://sbtulpqgionwhhxt.public.blob.vercel-storage.com/';

export default async function handler(request, response) {
    const { token } = request.query;
    
    console.log('=== TEMPORARY DOWNLOAD REQUEST ===');
    console.log('Token:', token);
    console.log('Method:', request.method);
    
    if (!token) {
        return response.status(400).json({ error: 'Download token required' });
    }
    
    try {
        // Get the download info from KV store
        const downloadInfo = await kv.get(`download:${token}`);
        
        if (!downloadInfo) {
            console.log('❌ Token not found or expired');
            return response.status(404).json({ 
                error: 'Download link expired or invalid. Please request a new profile report.' 
            });
        }
        
        console.log('Download info found:', downloadInfo);
        
        // Check if expired (24 hours)
        const now = new Date();
        const created = new Date(downloadInfo.createdAt);
        const hoursDiff = (now - created) / (1000 * 60 * 60);
        
        console.log('Hours since creation:', hoursDiff);
        
        if (hoursDiff > 24) {
            console.log('❌ Token expired, cleaning up');
            // Clean up expired token
            await kv.del(`download:${token}`);
            return response.status(410).json({ 
                error: 'Download link has expired (24 hours). Please retake the assessment to get a new report.' 
            });
        }
        
        // Validate archetype
        const validArchetypes = [
            'analyst', 'innovator', 'specialist',
            'commander', 'vanguard', 'pathfinder', 'advocate', 
            'forgemaster', 'finisher', 'orchestrator',
            'ambassador', 'inspirer', 'peacekeeper', 'guardian', 'shepherd'
        ];
        
        if (!validArchetypes.includes(downloadInfo.archetype)) {
            console.log('❌ Invalid archetype:', downloadInfo.archetype);
            return response.status(400).json({ error: 'Invalid archetype in download token' });
        }
        
        // Construct PDF URL
        const pdfUrl = `${PDF_BASE_URL}${downloadInfo.archetype}.pdf`;
        console.log('Fetching PDF from:', pdfUrl);
        
        // Fetch and serve the PDF
        const pdfResponse = await fetch(pdfUrl);
        
        if (!pdfResponse.ok) {
            console.log('❌ PDF not found at blob storage');
            return response.status(404).json({ 
                error: 'PDF report not found. Please contact support.' 
            });
        }
        
        const pdfBuffer = await pdfResponse.arrayBuffer();
        console.log('✅ PDF fetched successfully, size:', pdfBuffer.byteLength);
        
        // Set headers for PDF download
        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `inline; filename="${downloadInfo.firstName}-${downloadInfo.archetype}-profile.pdf"`);
        response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // Prevent caching
        response.setHeader('Pragma', 'no-cache');
        response.setHeader('Expires', '0');
        
        // Log the download
        console.log('✅ PDF served successfully to:', downloadInfo.email);
        
        // Optional: Track download in analytics
        try {
            const downloadKey = `downloaded:${token}`;
            await kv.set(downloadKey, {
                ...downloadInfo,
                downloadedAt: new Date().toISOString(),
                userAgent: request.headers['user-agent'] || 'unknown'
            }, { ex: 86400 }); // Keep download record for 24 hours
        } catch (analyticsError) {
            console.log('Analytics tracking failed:', analyticsError.message);
        }
        
        // Send the PDF
        return response.send(Buffer.from(pdfBuffer));
        
    } catch (error) {
        console.error('❌ Error serving temporary download:', error);
        return response.status(500).json({ 
            error: 'Failed to retrieve PDF report. Please try again or contact support.' 
        });
    }
}