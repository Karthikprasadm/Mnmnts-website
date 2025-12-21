const ImageKit = require("imagekit");
const { setSecurityHeaders } = require('./utils/response');

// Allow requests only from your production domains
const allowedOrigins = [
  "https://karthikprasadm.github.io",
  // add more allowed origins if needed
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (allowedOrigins.includes(origin)) return true;
  // Allow any .vercel.app domain for debugging
  if (/https:\/\/.+\.vercel\.app/.test(origin)) return true;
  return false;
}

module.exports = (req, res) => {
  try {
    const origin = req.headers.origin;
    if (isAllowedOrigin(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Vary", "Origin");
    
    // Add security headers
    setSecurityHeaders(res);
    
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    if (!isAllowedOrigin(origin)) {
      res.status(403).json({ error: "Origin not allowed" });
      return;
    }

    // Validate environment variables
    if (
      !process.env.IMAGEKIT_PUBLIC_KEY ||
      !process.env.IMAGEKIT_PRIVATE_KEY ||
      !process.env.IMAGEKIT_URL_ENDPOINT
    ) {
      res.status(500).json({ error: "Missing ImageKit environment variables" });
      return;
    }

    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });

    const signature = imagekit.getAuthenticationParameters();
    res.status(200).json(signature);
  } catch (err) {
    // Always set CORS headers for errors too!
    const origin = req.headers.origin;
    if (isAllowedOrigin(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Vary", "Origin");
    
    // Add security headers to error response
    setSecurityHeaders(res);
    
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};