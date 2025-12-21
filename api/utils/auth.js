// Authentication utility for API endpoints
// This ensures only authorized users can perform write operations

// SECURITY: API is read-only - no write operations allowed
// This file is for future use if write operations are needed

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || null;
const ALLOWED_IPS = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [];

function verifyAuth(req) {
  // For read-only API, always return true (no auth needed for GET)
  // This function is reserved for future write operations
  
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
  
  // Check token if provided
  if (ADMIN_TOKEN && token !== ADMIN_TOKEN) {
    return { authorized: false, reason: 'Invalid token' };
  }
  
  // Check IP whitelist if configured
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ALLOWED_IPS.length > 0 && !ALLOWED_IPS.includes(clientIP)) {
    return { authorized: false, reason: 'IP not allowed' };
  }
  
  return { authorized: true };
}

function requireAuth(req, res, next) {
  // For read-only API, reject all non-GET requests
  if (req.method !== 'GET') {
    res.status(403).json({
      success: false,
      error: 'Write operations are not allowed. This API is read-only.',
      allowedMethods: ['GET']
    });
    return;
  }
  
  // For GET requests, no auth needed
  if (next) next();
}

module.exports = {
  verifyAuth,
  requireAuth
};

