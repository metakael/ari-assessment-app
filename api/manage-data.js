// api/manage-data.js - Enhanced Data Management
import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    const { action, key, pattern, format } = request.query;
    
    // Add basic auth protection (optional)
    const authKey = request.headers.authorization;
    if (authKey !== `Bearer ${process.env.ADMIN_KEY}`) {
        return response.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        if (action === 'list') {
            // List all keys matching pattern
            const searchPattern = pattern || 'submission:*';
            const keys = await kv.keys(searchPattern);
            
            return response.status(200).json({
                pattern: searchPattern,
                count: keys.length,
                keys: keys
            });
        }
        
        if (action === 'delete' && key) {
            // Delete specific key
            await kv.del(key);
            return response.status(200).json({
                success: true,
                message: `Deleted key: ${key}`
            });
        }
        
        if (action === 'delete-pattern' && pattern) {
            // Delete all keys matching pattern
            const keys = await kv.keys(pattern);
            let deletedCount = 0;
            
            for (const key of keys) {
                await kv.del(key);
                deletedCount++;
            }
            
            return response.status(200).json({
                success: true,
                message: `Deleted ${deletedCount} keys matching pattern: ${pattern}`,
                deletedCount
            });
        }
        
        if (action === 'export') {
            // Export all data
            const searchPattern = pattern || 'submission:*';
            const keys = await kv.keys(searchPattern);
            const allData = [];
            
            for (const key of keys) {
                const data = await kv.get(key);
                if (data) {
                    allData.push({
                        key,
                        ...data
                    });
                }
            }
            
            if (format === 'csv') {
                // Convert to CSV
                if (allData.length === 0) {
                    return response.status(200).send('No data found');
                }
                
                const headers = Object.keys(allData[0]);
                const csvContent = [
                    headers.join(','),
                    ...allData.map(row => 
                        headers.map(header => {
                            const value = row[header];
                            // Handle nested objects and arrays
                            if (typeof value === 'object' && value !== null) {
                                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                            }
                            return `"${String(value || '').replace(/"/g, '""')}"`;
                        }).join(',')
                    )
                ].join('\n');
                
                response.setHeader('Content-Type', 'text/csv');
                response.setHeader('Content-Disposition', `attachment; filename="submissions_${new Date().toISOString().split('T')[0]}.csv"`);
                return response.status(200).send(csvContent);
            }
            
            // Default: JSON format
            response.setHeader('Content-Type', 'application/json');
            response.setHeader('Content-Disposition', `attachment; filename="submissions_${new Date().toISOString().split('T')[0]}.json"`);
            return response.status(200).json(allData);
        }
        
        if (action === 'stats') {
            // Get statistics
            const submissionKeys = await kv.keys('submission:*');
            const downloadKeys = await kv.keys('download:*');
            const summaryKeys = await kv.keys('summary:*');
            
            // Sample some submissions for archetype breakdown
            const sampleData = [];
            const sampleSize = Math.min(50, submissionKeys.length);
            
            for (let i = 0; i < sampleSize; i++) {
                const data = await kv.get(submissionKeys[i]);
                if (data && data.archetype) {
                    sampleData.push(data);
                }
            }
            
            // Count archetypes
            const archetypeCounts = {};
            const domainCounts = {};
            
            sampleData.forEach(submission => {
                if (submission.archetype) {
                    archetypeCounts[submission.archetype] = (archetypeCounts[submission.archetype] || 0) + 1;
                }
                if (submission.primaryDomain) {
                    domainCounts[submission.primaryDomain] = (domainCounts[submission.primaryDomain] || 0) + 1;
                }
            });
            
            return response.status(200).json({
                totalSubmissions: submissionKeys.length,
                activeDownloads: downloadKeys.length,
                summaryRecords: summaryKeys.length,
                sampleSize,
                archetypeBreakdown: archetypeCounts,
                domainBreakdown: domainCounts,
                oldestSubmission: sampleData.length > 0 ? Math.min(...sampleData.map(s => new Date(s.completedAt).getTime())) : null,
                newestSubmission: sampleData.length > 0 ? Math.max(...sampleData.map(s => new Date(s.completedAt).getTime())) : null
            });
        }
        
        // Default: Show usage
        return response.status(200).json({
            message: 'Data Management API',
            usage: {
                list: '/api/manage-data?action=list&pattern=submission:*',
                delete: '/api/manage-data?action=delete&key=submission:sess_123...',
                deletePattern: '/api/manage-data?action=delete-pattern&pattern=submission:*',
                exportJSON: '/api/manage-data?action=export&pattern=submission:*',
                exportCSV: '/api/manage-data?action=export&pattern=submission:*&format=csv',
                stats: '/api/manage-data?action=stats'
            },
            note: 'Requires Authorization header with admin key'
        });
        
    } catch (error) {
        return response.status(500).json({
            error: 'Operation failed',
            details: error.message
        });
    }
}