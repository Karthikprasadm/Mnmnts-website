// Gallery Videos API Endpoint
const { setCORSHeaders, handleOptions } = require('../utils/cors');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/response');
const { loadJSON } = require('../utils/data-loader');

module.exports = async (req, res) => {
  setCORSHeaders(req, res);

  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
    return;
  }

  try {
    // READ-ONLY: Only allow GET requests
    if (req.method !== 'GET') {
      res.status(405).json({ 
        success: false,
        error: 'Method not allowed. This API is read-only.',
        allowedMethods: ['GET']
      });
      return;
    }
    
    // Get all videos or a specific video by ID
    const { id } = req.query;
    
    const videosData = loadJSON('videos-data.json');
    
    if (id) {
      // Return specific video
      const video = videosData.videos.find(v => v.id === parseInt(id));
      if (!video) {
        notFoundResponse(res, 'Video');
        return;
      }
      successResponse(res, video);
    } else {
      // Return all videos
      successResponse(res, {
        videos: videosData.videos,
        total: videosData.videos.length,
      });
    }
  } catch (error) {
    console.error('Gallery videos API error:', error);
    errorResponse(res, 'Failed to fetch gallery videos', 500, error.message);
  }
};

