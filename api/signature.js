// ImageKit Signature Endpoint for Vercel Serverless Functions
const { v4: uuidv4 } = require('uuid');
const ImageKit = require('imagekit');
const { setCORSHeaders, handleOptions } = require('./utils/cors');
const { setSecurityHeaders } = require('./utils/response');

module.exports = async (req, res) => {
  setCORSHeaders(req, res);

  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
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
    // Initialize ImageKit with environment variables
    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });

    // Check if required environment variables are set
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
      console.error('ImageKit environment variables are not set');
      setSecurityHeaders(res);
      res.status(500).json({
        success: false,
        error: 'ImageKit configuration is missing. Please check environment variables.'
      });
      return;
    }

    // Generate a unique token for every request
    const token = uuidv4();
    const expire = Math.floor(Date.now() / 1000) + 60 * 5; // 5 minutes from now
    
    // Get authentication parameters
    const signature = imagekit.getAuthenticationParameters(token, expire);

    // Return signature, expire, and token directly (not wrapped in data object)
    // The upload.html expects: { signature, expire, token }
    setCORSHeaders(req, res);
    res.status(200).json({
      signature: signature.signature,
      expire: signature.expire,
      token: signature.token
    });
  } catch (error) {
    console.error('Error generating ImageKit signature:', error);
    setSecurityHeaders(res);
    res.status(500).json({
      success: false,
      error: 'Failed to generate upload signature. Please try again later.'
    });
    return;
  }
};

