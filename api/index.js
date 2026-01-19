// API Index/Health Check Endpoint
const { setCORSHeaders, handleOptions } = require('./utils/cors');
const { successResponse } = require('./utils/response');
const { generalRateLimiter } = require('./utils/rateLimit');

module.exports = async (req, res) => {
  setCORSHeaders(req, res);

  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
    return;
  }

  // Apply rate limiting
  generalRateLimiter(req, res, () => {});
  
  // Check if rate limit was exceeded (429 status set)
  if (res.statusCode === 429) {
    return;
  }

  // READ-ONLY: Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ 
      success: false,
      error: 'Method not allowed. This API is read-only.',
      allowedMethods: ['GET']
    });
    return;
  }
  
  successResponse(res, {
    message: 'API Health Check',
    version: '1.0.0',
    endpoints: {
      signature: '/api/signature',
      imagekitConfig: '/api/imagekit-config'
    },
    documentation: 'https://github.com/Karthikprasadm/Mnmnts-website',
    status: 'operational',
    note: 'Only utility endpoints remain. Portfolio API endpoints have been removed.'
  });
};

