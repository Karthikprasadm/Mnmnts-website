// API Index/Health Check Endpoint
const { setCORSHeaders, handleOptions } = require('../utils/cors');
const { successResponse } = require('../utils/response');

module.exports = async (req, res) => {
  setCORSHeaders(req, res);

  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
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
    message: 'Portfolio API v1.0',
    version: '1.0.0',
    readOnly: true,
    endpoints: {
      gallery: {
        images: '/api/gallery/images',
        videos: '/api/gallery/videos'
      },
      about: '/api/about',
      projects: '/api/projects',
      social: '/api/social',
      portfolio: '/api/portfolio'
    },
    documentation: 'https://github.com/Karthikprasadm/Karthikprasadm.github.io',
    status: 'operational',
    note: 'This API is read-only. All endpoints only accept GET requests.'
  });
};

