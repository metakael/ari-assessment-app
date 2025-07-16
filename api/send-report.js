// api/send-report.js - Simple Test
export default async function handler(request, response) {
    console.log('=== SEND REPORT FUNCTION CALLED ===');
    console.log('Method:', request.method);
    console.log('Body:', JSON.stringify(request.body, null, 2));
    
    return response.status(200).json({ 
        message: 'send-report function is working!',
        method: request.method,
        timestamp: new Date().toISOString(),
        body: request.body
    });
}