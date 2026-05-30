// CORS utility for API endpoints
const { setSecurityHeaders } = require('./response');

const defaultProductionOrigins = [
  "https://mnmntsweb.vercel.app",
  "https://karthikprasadm.github.io",
];

const developmentOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", // Vite dev server
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://localhost:8080",
  "http://127.0.0.1:5500",
];

function getConfiguredProductionOrigins() {
  const configured = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return configured.length > 0 ? configured : defaultProductionOrigins;
}

function isAllowedOrigin(origin) {
  if (!origin) return false;

  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? getConfiguredProductionOrigins()
    : [...getConfiguredProductionOrigins(), ...developmentOrigins];

  return allowedOrigins.includes(origin);
}

function setCORSHeaders(req, res) {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  // Allow Spotify proxy requests with bearer tokens.
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
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
