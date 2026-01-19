// Spotify Token Management Endpoint
// Handles OAuth token exchange and refresh
const { setCORSHeaders, handleOptions } = require('../../utils/cors');
const { successResponse, errorResponse } = require('../../utils/response');

module.exports = async (req, res) => {
  setCORSHeaders(req, res);

  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
    return;
  }

  // Only allow POST requests for token exchange
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed. Only POST is supported.', 405);
  }

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return errorResponse(res, 
      process.env.NODE_ENV === 'production'
        ? 'Service is temporarily unavailable. Please try again later.'
        : 'Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.', 
      503
    );
  }

  try {
    const { code, redirect_uri, grant_type = 'authorization_code' } = req.body;

    if (grant_type === 'authorization_code') {
      // Exchange authorization code for access token
      if (!code || !redirect_uri) {
        return errorResponse(res, 'Missing required parameters: code and redirect_uri are required.', 400);
      }

      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirect_uri,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        // Sanitize Spotify API error messages to avoid leaking details
        const isProduction = process.env.NODE_ENV === 'production';
        const errorMsg = isProduction 
          ? 'Authentication failed. Please try again.'
          : (tokenData.error_description || tokenData.error || 'Failed to exchange authorization code');
        return errorResponse(res, errorMsg, tokenResponse.status >= 500 ? 500 : tokenResponse.status);
      }

      return successResponse(res, {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type,
      });
    } else if (grant_type === 'refresh_token') {
      // Refresh access token using refresh token
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return errorResponse(res, 'Missing required parameter: refresh_token is required.', 400);
      }

      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refresh_token,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        // Sanitize Spotify API error messages to avoid leaking details
        const isProduction = process.env.NODE_ENV === 'production';
        const errorMsg = isProduction 
          ? 'Token refresh failed. Please re-authenticate.'
          : (tokenData.error_description || tokenData.error || 'Failed to refresh token');
        return errorResponse(res, errorMsg, tokenResponse.status >= 500 ? 500 : tokenResponse.status);
      }

      return successResponse(res, {
        access_token: tokenData.access_token,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type,
        // Note: Spotify may or may not return a new refresh_token
        refresh_token: tokenData.refresh_token || refresh_token,
      });
    } else {
      return errorResponse(res, 'Invalid grant_type. Supported values: authorization_code, refresh_token', 400);
    }
  } catch (error) {
    console.error('Spotify token error:', error);
    // errorResponse will automatically sanitize the message in production
    return errorResponse(res, `Internal server error: ${error.message}`, 500);
  }
};

