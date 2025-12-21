// Standardized API response helpers
// Security headers as per SECURITY.md documentation
function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
}

function successResponse(res, data, statusCode = 200) {
  // Add cache headers for API responses
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  // Add security headers
  setSecurityHeaders(res);
  res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}

function errorResponse(res, message, statusCode = 500, details = null) {
  // Add security headers to error responses as well
  setSecurityHeaders(res);
  const response = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  };
  
  if (details) {
    response.details = details;
  }
  
  res.status(statusCode).json(response);
}

function notFoundResponse(res, resource = 'Resource') {
  errorResponse(res, `${resource} not found`, 404);
}

function badRequestResponse(res, message = 'Bad request') {
  errorResponse(res, message, 400);
}

function unauthorizedResponse(res, message = 'Unauthorized') {
  errorResponse(res, message, 401);
}

module.exports = {
  successResponse,
  errorResponse,
  notFoundResponse,
  badRequestResponse,
  unauthorizedResponse,
  setSecurityHeaders, // Export for use in other endpoints
};

