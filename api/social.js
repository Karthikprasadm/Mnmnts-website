// Social Links API Endpoint
const { setCORSHeaders, handleOptions } = require('../utils/cors');
const { successResponse, errorResponse } = require('../utils/response');

// Social links data
const socialLinks = {
  instagram: {
    url: "https://www.instagram.com/kkarthhikk",
    label: "Instagram",
    icon: "instagram"
  },
  linkedin: {
    url: "https://www.linkedin.com/in/karthik-prasad-m-7673b5356/",
    label: "LinkedIn",
    icon: "linkedin"
  },
  pinterest: {
    url: "https://pin.it/70AOzYsfW",
    label: "Pinterest",
    icon: "pinterest"
  },
  spotify: {
    url: "https://open.spotify.com/user/31g54rthdkjwc7tk2yzwlkptbbqi",
    label: "Spotify",
    icon: "spotify"
  },
  github: {
    url: "https://github.com/Karthikprasadm",
    label: "GitHub",
    icon: "github"
  }
};

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
    
    const { platform } = req.query;
    
    if (platform) {
      // Return specific platform
      const link = socialLinks[platform.toLowerCase()];
      if (!link) {
        res.status(404).json({ error: 'Social platform not found' });
        return;
      }
      successResponse(res, link);
    } else {
      // Return all social links
      successResponse(res, {
        links: Object.values(socialLinks),
        platforms: Object.keys(socialLinks),
        total: Object.keys(socialLinks).length
      });
    }
  } catch (error) {
    console.error('Social links API error:', error);
    errorResponse(res, 'Failed to fetch social links', 500, error.message);
  }
};

