// About Page Content API Endpoint
const { setCORSHeaders, handleOptions } = require('../utils/cors');
const { successResponse, errorResponse } = require('../utils/response');

// About page content - can be moved to a JSON file later if needed
const aboutData = {
  name: "Karthik Prasad M",
  title: "Web Developer & Creative Storyteller",
  bio: "I'm a student who's a bit obsessed with building accessible, pixel-perfect user interfaces — where design meets engineering. I love crafting experiences that look amazing and actually work well. Thoughtful, fast, and usable -- that's kinda the vibe.",
  interests: [
    "geopolitics and the now",
    "waving through music",
    "GAMING",
    "turning mnmnts into stories"
  ],
  skills: [
    "making cool stuff on the web",
    "content that doesn't make you yawn"
  ],
  moreAbout: "When I'm not building or learning, I'm probably climbing, gaming, doom-scrolling world updates, hanging out with shimmy (pet turtle) and my fam, or running around the city with my friends.",
  tagline: "stay odd. stay wandering!!",
  image: "https://ik.imagekit.io/ijv7nmfqx/Website_showcase/875320.jpg?updatedAt=1748107186320&v=2"
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
    
    successResponse(res, aboutData);
  } catch (error) {
    console.error('About API error:', error);
    errorResponse(res, 'Failed to fetch about data', 500, error.message);
  }
};

