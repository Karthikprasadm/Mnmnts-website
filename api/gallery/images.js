// Gallery Images API Endpoint
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
    
    // Get all images or a specific image by ID
    const { id } = req.query;
    
    const galleryData = loadJSON('gallery-data.json');
    
    if (id) {
      // Return specific image
      const image = galleryData.images.find(img => img.id === parseInt(id));
      if (!image) {
        notFoundResponse(res, 'Image');
        return;
      }
      successResponse(res, image);
    } else {
      // Return all images with default image
      successResponse(res, {
        images: galleryData.images,
        defaultImage: galleryData.defaultImage,
        total: galleryData.images.length,
      });
    }
  } catch (error) {
    console.error('Gallery images API error:', error);
    errorResponse(res, 'Failed to fetch gallery images', 500, error.message);
  }
};

