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
  
  // Content Security Policy (adjust as needed)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
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
 * Send an error JSON response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 */
function errorResponse(res, message, statusCode = 500) {
  setSecurityHeaders(res);
  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

module.exports = {
  setSecurityHeaders,
  successResponse,
  errorResponse,
};

