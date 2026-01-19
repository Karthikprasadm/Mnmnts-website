// ImageKit Configuration Endpoint (Public Key and URL Endpoint only)
// Returns only public configuration - private key is never exposed
const { setCORSHeaders, handleOptions } = require('./utils/cors');
const { setSecurityHeaders } = require('./utils/response');
const { configRateLimiter } = require('./utils/rateLimit');

module.exports = async (req, res) => {
  setCORSHeaders(req, res);

  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
    return;
  }

  // Apply rate limiting
  configRateLimiter(req, res, () => {});
  
  // Check if rate limit was exceeded (429 status set)
  if (res.statusCode === 429) {
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    setSecurityHeaders(res);
    res.status(405).json({
      success: false,
      error: 'Method not allowed. Only GET requests are supported.'
    });
    return;
  }

  try {
    // Return only public configuration (never private key)
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !urlEndpoint) {
      console.error('ImageKit public configuration is missing');
      setSecurityHeaders(res);
      res.status(500).json({
        success: false,
        error: 'ImageKit configuration is not available.'
      });
      return;
    }

    // Return only public configuration
    setCORSHeaders(req, res);
    res.status(200).json({
      success: true,
      publicKey: publicKey,
      urlEndpoint: urlEndpoint
    });
  } catch (error) {
    console.error('Error retrieving ImageKit config:', error);
    setSecurityHeaders(res);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve ImageKit configuration.'
    });
    return;
  }
};
