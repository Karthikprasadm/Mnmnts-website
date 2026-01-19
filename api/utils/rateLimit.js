// Rate limiting utility for API endpoints
// Simple in-memory rate limiter (for serverless functions)
// For production with Express, use express-rate-limit

const { setSecurityHeaders } = require('./response');

// In-memory store for rate limiting (resets on serverless function restart)
const rateLimitStore = new Map();

/**
 * Simple rate limiter for serverless functions
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.message - Error message when limit exceeded
 * @returns {Function} Middleware function
 */
function createRateLimiter({ windowMs = 60000, max = 10, message = 'Too many requests, please try again later.' }) {
  return (req, res, next) => {
    // Get client IP (works for both Express and serverless)
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded 
      ? forwarded.split(',')[0].trim() 
      : (req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || 'unknown');
    
    const key = ip;
    const now = Date.now();
    
    // Clean up old entries (older than windowMs) - run cleanup every 100 requests to avoid overhead
    if (Math.random() < 0.01) {
      const cutoff = now - windowMs;
      for (const [k, v] of rateLimitStore.entries()) {
        if (v.lastReset < cutoff) {
          rateLimitStore.delete(k);
        }
      }
    }
    
    // Get or create entry for this IP
    let entry = rateLimitStore.get(key);
    
    if (!entry || (now - entry.lastReset) >= windowMs) {
      // Reset or create entry
      entry = {
        count: 0,
        lastReset: now
      };
      rateLimitStore.set(key, entry);
    }
    
    // Check if limit exceeded
    if (entry.count >= max) {
      setSecurityHeaders(res);
      const retryAfter = Math.ceil((entry.lastReset + windowMs - now) / 1000);
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: retryAfter
      });
      return;
    }
    
    // Increment counter
    entry.count++;
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('X-RateLimit-Reset', new Date(entry.lastReset + windowMs).toISOString());
    
    // Continue to next middleware
    if (next && typeof next === 'function') {
      next();
    }
  };
}

/**
 * Rate limiter for signature endpoint (more restrictive)
 */
const signatureRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 20, // 20 requests per minute
  message: 'Too many signature requests. Please try again in a minute.'
});

/**
 * Rate limiter for config endpoint (less restrictive)
 */
const configRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many configuration requests. Please try again in a minute.'
});

/**
 * Rate limiter for general API endpoints
 */
const generalRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many requests. Please try again in a minute.'
});

module.exports = {
  createRateLimiter,
  signatureRateLimiter,
  configRateLimiter,
  generalRateLimiter
};
