// Spotify API Proxy Endpoint
// Proxies requests to Spotify Web API with user's access token
const { setCORSHeaders, handleOptions } = require('../../utils/cors');
const { successResponse, errorResponse } = require('../../utils/response');

module.exports = async (req, res) => {
  setCORSHeaders(req, res);

  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
    return;
  }

  // Only allow GET requests for API proxy
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed. Only GET is supported.', 405);
  }

  try {
    const { endpoint } = req.query;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!endpoint) {
      return errorResponse(res, 'Missing required parameter: endpoint', 400);
    }

    if (!accessToken) {
      return errorResponse(res, 'Missing authorization token. Please provide Bearer token in Authorization header.', 401);
    }

    // Normalize endpoint (ensure it starts with /v1/)
    const normalizedEndpoint = endpoint.startsWith('/v1/') ? endpoint : `/v1/${endpoint}`;

    // Make request to Spotify Web API
    const spotifyResponse = await fetch(`https://api.spotify.com${normalizedEndpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await spotifyResponse.json();

    if (!spotifyResponse.ok) {
      return errorResponse(res, data.error?.message || 'Spotify API request failed', spotifyResponse.status);
    }

    return successResponse(res, data);
  } catch (error) {
    console.error('Spotify API proxy error:', error);
    return errorResponse(res, `Internal server error: ${error.message}`, 500);
  }
};

