// api/test-email.js
export default function handler(request, response) {
    console.log('test-email function called!');
    
    return response.status(200).json({
        success: true,
        message: 'test-email function is working!',
        method: request.method,
        timestamp: new Date().toISOString()
    });
}