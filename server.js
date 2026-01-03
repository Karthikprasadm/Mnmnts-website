// Renamed to disable custom server for Vercel deployment. Use this only for local development.
// To use locally, rename back to server.js

// Backend: Express.js Server with Multer for File Uploads
require('dotenv').config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ImageKit = require('imagekit');
const { v4: uuidv4 } = require('uuid');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Configure ImageKit (only if env vars are present)
let imagekit = null;
if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
  });
  console.log('✅ ImageKit configured');
} else {
  console.log('⚠️  ImageKit not configured (missing .env file). Upload features will not work.');
}

const app = express();
const port = 3000;

// Ensure the "uploads" directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Function to sanitize filenames
const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9._-]/g, "");
};

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save files in the "uploads" folder
    },
    filename: (req, file, cb) => {
        // Sanitize the filename and add a timestamp to avoid conflicts
        const sanitizedFilename = sanitizeFilename(file.originalname);
        cb(null, Date.now() + "-" + sanitizedFilename);
    },
});

// Allow only images and videos to be uploaded
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error("Only images and videos are allowed!"), false); // Reject the file
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 150 * 1024 * 1024 } }); // 150MB limit

// Enable JSON parsing for API endpoints
app.use(express.json());

// Serve built Repository (Astro) files from /repo
const repositoryDist = path.join(__dirname, 'Repository', 'dist');
if (fs.existsSync(repositoryDist)) {
  // Explicitly handle index.html routes FIRST (these MUST come before express.static)
  app.get('/repo', (req, res) => {
    const builtIndex = path.join(repositoryDist, 'index.html');
    console.log('✅ Serving Repository index.html from:', builtIndex);
    res.sendFile(builtIndex);
  });
  app.get('/repo/', (req, res) => {
    const builtIndex = path.join(repositoryDist, 'index.html');
    console.log('✅ Serving Repository index.html from:', builtIndex);
    res.sendFile(builtIndex);
  });
  app.get('/repo/index.html', (req, res) => {
    const builtIndex = path.join(repositoryDist, 'index.html');
    console.log('✅ Serving Repository index.html from:', builtIndex);
    res.sendFile(builtIndex);
  });
  
  // Then serve all other built files from dist folder
  app.use('/repo', express.static(repositoryDist));
  console.log('✅ Serving built Repository from dist/');
} else {
  console.warn('⚠️  Repository dist/ not found. Run: cd Repository && npm run build');
}

// Serve built Spotify Visualizer files FIRST (before general static files)
// This ensures the built files take precedence over source files
const spotifyVisualizerDist = path.join(__dirname, 'spotify-visualiser', 'dist');
if (fs.existsSync(spotifyVisualizerDist)) {
  // Explicitly handle index.html routes FIRST (these MUST come before express.static)
  app.get('/spotify-visualiser/', (req, res) => {
    const builtIndex = path.join(spotifyVisualizerDist, 'index.html');
    console.log('✅ Serving built index.html from:', builtIndex);
    res.sendFile(builtIndex);
  });
  app.get('/spotify-visualiser/index.html', (req, res) => {
    const builtIndex = path.join(spotifyVisualizerDist, 'index.html');
    console.log('✅ Serving built index.html from:', builtIndex);
    res.sendFile(builtIndex);
  });
  
  // Then serve all other built files from dist folder
  app.use('/spotify-visualiser', express.static(spotifyVisualizerDist));
  console.log('✅ Serving built Spotify Visualizer from dist/');
} else {
  console.warn('⚠️  Spotify Visualizer dist/ not found. Run: cd spotify-visualiser && npm run build');
}

// Serve static files (e.g., HTML, CSS, JS) from the project root
// BUT exclude spotify-visualiser source directory to prevent conflicts
const staticMiddleware = express.static(__dirname);
app.use((req, res, next) => {
  // Block access to source files in spotify-visualiser
  if (req.path.startsWith('/spotify-visualiser/src')) {
    console.log('🚫 Blocked source file request:', req.path);
    return res.status(404).send('Source files not available. Please use the built version.');
  }
  
  // Skip serving other spotify-visualiser source files (but allow dist/ via the route above)
  if (req.path.startsWith('/spotify-visualiser/') && 
      !req.path.startsWith('/spotify-visualiser/assets/') &&
      !req.path.startsWith('/spotify-visualiser/manifest') &&
      !req.path.startsWith('/spotify-visualiser/registerSW') &&
      !req.path.startsWith('/spotify-visualiser/sw') &&
      req.path !== '/spotify-visualiser/' &&
      req.path !== '/spotify-visualiser/index.html') {
    // Let the Spotify Visualizer routes handle this - don't serve source files
    return next();
  }
  // Serve other static files normally
  staticMiddleware(req, res, next);
});

// Serve index.html on root request
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Local signature endpoint for ImageKit direct upload
app.get('/api/signature', (req, res) => {
  if (!imagekit) {
    return res.status(503).json({
      success: false,
      error: 'ImageKit not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env file'
    });
  }
  const token = uuidv4();
  const expire = Math.floor(Date.now() / 1000) + 60 * 5; // 5 minutes from now
  const signature = imagekit.getAuthenticationParameters(token, expire);
  console.log({ signature: signature.signature, expire: signature.expire, token: signature.token });
  res.status(200).json({
    signature: signature.signature,
    expire: signature.expire,
    token: signature.token
  });
});

// Spotify API endpoints (for local development)
// In production, these are handled by Vercel serverless functions in /api/spotify/
app.post('/api/spotify/token', async (req, res) => {
  const { setCORSHeaders, handleOptions } = require('./api/utils/cors');
  const { successResponse, errorResponse } = require('./api/utils/response');
  
  setCORSHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
    return;
  }

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      error: 'Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.'
    });
  }

  try {
    const { code, redirect_uri, grant_type = 'authorization_code', refresh_token } = req.body;

    if (grant_type === 'authorization_code') {
      if (!code || !redirect_uri) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: code and redirect_uri are required.'
        });
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
        return res.status(tokenResponse.status).json({
          success: false,
          error: tokenData.error_description || tokenData.error || 'Failed to exchange authorization code'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_in: tokenData.expires_in,
          token_type: tokenData.token_type,
        }
      });
    } else if (grant_type === 'refresh_token') {
      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: refresh_token is required.'
        });
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
        return res.status(tokenResponse.status).json({
          success: false,
          error: tokenData.error_description || tokenData.error || 'Failed to refresh token'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          access_token: tokenData.access_token,
          expires_in: tokenData.expires_in,
          token_type: tokenData.token_type,
          refresh_token: tokenData.refresh_token || refresh_token,
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid grant_type. Supported values: authorization_code, refresh_token'
      });
    }
  } catch (error) {
    console.error('Spotify token error:', error);
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${error.message}`
    });
  }
});

app.get('/api/spotify', async (req, res) => {
  const { setCORSHeaders, handleOptions } = require('./api/utils/cors');
  const { successResponse, errorResponse } = require('./api/utils/response');
  
  setCORSHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
    return;
  }

  try {
    const { endpoint } = req.query;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: endpoint'
      });
    }

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: 'Missing authorization token. Please provide Bearer token in Authorization header.'
      });
    }

    const normalizedEndpoint = endpoint.startsWith('/v1/') ? endpoint : `/v1/${endpoint}`;

    const spotifyResponse = await fetch(`https://api.spotify.com${normalizedEndpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await spotifyResponse.json();

    if (!spotifyResponse.ok) {
      return res.status(spotifyResponse.status).json({
        success: false,
        error: data.error?.message || 'Spotify API request failed'
      });
    }

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Spotify API proxy error:', error);
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${error.message}`
    });
  }
});

// ImageKit upload handler for /upload endpoint
app.post('/upload', upload.array('media'), async (req, res) => {
  try {
    if (!imagekit) {
      return res.status(503).json({
        success: false,
        error: 'ImageKit not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env file'
      });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('No files uploaded.');
    }
    const uploadResults = [];
    for (const file of req.files) {
      try {
        // Log file info
        console.log('Uploading file:', file.originalname);
        // Upload to ImageKit
        const result = await imagekit.upload({
          file: fs.readFileSync(file.path),
          fileName: file.originalname,
          folder: '/Upload_M-O-M' // Try removing this if files don't show up
        });
        console.log('ImageKit upload result:', result);
        if (!result.url || !result.fileId) {
          throw new Error('ImageKit did not return a valid URL or fileId');
        }
        uploadResults.push({
          originalname: file.originalname,
          url: result.url,
          fileId: result.fileId,
          type: result.type
        });
      } catch (ikErr) {
        console.error('Failed to upload to ImageKit:', ikErr);
        // Optionally, you can return here to stop on first failure
        return res.status(500).send(`Failed to upload file ${file.originalname} to ImageKit: ${ikErr.message}`);
      } finally {
        // Always delete the local file
        fs.unlinkSync(file.path);
      }
    }
    res.status(200).json({ message: 'Files uploaded to ImageKit!', files: uploadResults });
  } catch (err) {
    console.error('ImageKit upload error:', err);
    res.status(500).send(`Failed to upload files to ImageKit: ${err.message}`);
  }
});

// Error handling for file uploads
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Handle Multer errors (e.g., file size limit exceeded)
        return res.status(400).send(`Multer error: ${err.message}`);
    } else if (err) {
        // Handle other errors (e.g., invalid file type)
        return res.status(400).send(`Error: ${err.message}`);
    }
    next();
});

// Catch-all for 404 errors (must be after all other routes)
app.use((req, res, next) => {
  res.status(404).sendFile(__dirname + '/404.html');
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Server accessible on http://127.0.0.1:${port}`);
});
