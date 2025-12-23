// CORS utility for API endpoints
const { setSecurityHeaders } = require('./response');

const allowedOrigins = [
  "https://karthikprasadm.github.io",
  "http://localhost:3000",
  "http://localhost:5173", // Vite dev server
  "http://localhost:8080",
  "http://127.0.0.1:5500",
  // Add more allowed origins if needed
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (allowedOrigins.includes(origin)) return true;
  // Allow any .vercel.app domain for debugging
  if (/https?:\/\/.+\.vercel\.app/.test(origin)) return true;
  // Allow localhost for development
  if (/http:\/\/localhost:\d+/.test(origin)) return true;
  return false;
}

function setCORSHeaders(req, res) {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  // Allow GET, POST, and OPTIONS methods (POST needed for token endpoint)
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
  res.setHeader("Vary", "Origin");
  
  // Use centralized security headers function
  setSecurityHeaders(res);
}

function handleOptions(req, res) {
  setCORSHeaders(req, res);
  res.status(200).end();
}

module.exports = {
  setCORSHeaders,
  handleOptions,
  isAllowedOrigin,
};

