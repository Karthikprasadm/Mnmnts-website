// General Portfolio Information API Endpoint
const { setCORSHeaders, handleOptions } = require('../utils/cors');
const { successResponse, errorResponse } = require('../utils/response');

// General portfolio metadata
const portfolioInfo = {
  name: "Museum Of Moments",
  alternateName: "mnmnts",
  description: "A minimalist, interactive web experience designed as a digital museum of personal or imagined moments in time. This project combines storytelling, aesthetic visuals, and smooth transitions to showcase moments as if they were constellations in a galaxy.",
  url: "https://karthikprasadm.github.io/",
  author: {
    name: "Karthik Prasad M",
    email: "wingspawn28@gmail.com",
    role: "Web Developer & Creative Storyteller"
  },
  features: [
    "Gallery of curated images and videos",
    "Smooth transitions and interactive thumbnails",
    "Direct uploads to ImageKit",
    "Responsive, modern UI with dark theme",
    "Social links integration"
  ],
  techStack: {
    frontend: ["HTML", "CSS", "JavaScript"],
    hosting: ["GitHub Pages", "Vercel"],
    media: "ImageKit.io"
  },
  version: "1.0.0",
  lastUpdated: new Date().toISOString()
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
    
    successResponse(res, portfolioInfo);
  } catch (error) {
    console.error('Portfolio API error:', error);
    errorResponse(res, 'Failed to fetch portfolio information', 500, error.message);
  }
};

