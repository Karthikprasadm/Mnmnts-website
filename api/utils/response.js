// Response utility for API endpoints
// Provides standardized response formatting and security headers

/**
 * Set security headers on response
 * @param {Object} res - Express response object
 */
function setSecurityHeaders(res) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy - strict (no unsafe-inline or unsafe-eval)
  // API endpoints return JSON only, so no inline scripts/styles needed
  // For static HTML pages, CSP is configured in vercel.json
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://ik.imagekit.io https://api.imagekit.io https://sdk.scdn.co https://accounts.spotify.com; frame-ancestors 'none';"
  );
}

/**
 * Send a successful JSON response
 * @param {Object} res - Express response object
 * @param {*} data - Data to send in response
 * @param {number} statusCode - HTTP status code (default: 200)
 */
function successResponse(res, data, statusCode = 200) {
  setSecurityHeaders(res);
  res.status(statusCode).json({
    success: true,
    data: data,
  });
}

/**
 * Sanitize error message for production
 * Prevents leaking internal details to clients
 * @param {string} message - Original error message
 * @param {number} statusCode - HTTP status code
 * @returns {string} Sanitized error message
 */
function sanitizeErrorMessage(message, statusCode) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // In production, use generic messages for server errors
  if (isProduction && statusCode >= 500) {
    return 'An internal server error occurred. Please try again later.';
  }
  
  // For client errors (4xx), we can be more specific but still avoid internal details
  if (isProduction && statusCode >= 400 && statusCode < 500) {
    // Remove internal details like environment variable names, stack traces, etc.
    const sanitized = message
      .replace(/environment variables?/gi, 'configuration')
      .replace(/SPOTIFY_CLIENT_ID|SPOTIFY_CLIENT_SECRET|IMAGEKIT_PUBLIC_KEY|IMAGEKIT_PRIVATE_KEY|IMAGEKIT_URL_ENDPOINT/gi, 'credentials')
      .replace(/process\.env\.[A-Z_]+/gi, 'configuration')
      .replace(/at .+:\d+:\d+/g, '') // Remove stack trace locations
      .replace(/\n.*/g, '') // Remove multi-line details
      .trim();
    
    return sanitized || 'Invalid request. Please check your input and try again.';
  }
  
  // In development, return full message for debugging
  return message;
}

/**
 * Send an error JSON response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (will be sanitized in production)
 * @param {number} statusCode - HTTP status code (default: 500)
 */
function errorResponse(res, message, statusCode = 500) {
  setSecurityHeaders(res);
  const sanitizedMessage = sanitizeErrorMessage(message, statusCode);
  res.status(statusCode).json({
    success: false,
    error: sanitizedMessage,
  });
}

module.exports = {
  setSecurityHeaders,
  successResponse,
  errorResponse,
};

