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
const { createClient } = require('@supabase/supabase-js');

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
const projectEditPassword = process.env.PROJECT_EDIT_PASSWORD || 'Wingspawn@272815';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null;

if (supabase) {
  console.log('✅ Supabase configured for project edits');
} else {
  console.log('⚠️  Supabase not configured (missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).');
}

// Ensure the "uploads" directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Reserved filenames on Windows (case-insensitive)
const RESERVED_NAMES = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
];

// Function to sanitize filenames - strict validation
const sanitizeFilename = (filename) => {
    if (!filename || typeof filename !== 'string') {
        return 'file';
    }
    
    // Remove path traversal attempts, null bytes, and control characters
    let sanitized = filename
        .replace(/\.\./g, '')                    // Remove path traversal
        .replace(/\0/g, '')                       // Remove null bytes
        .replace(/[\x00-\x1F\x7F]/g, '')         // Remove control characters
        .replace(/[<>:"|?*]/g, '')               // Remove Windows forbidden chars
        .replace(/^[\s.]+|[\s.]+$/g, '')         // Remove leading/trailing dots and spaces
        .replace(/\.{2,}/g, '.')                  // Replace multiple dots with single dot
        .trim();
    
    // Ensure filename is not empty
    if (!sanitized || sanitized.length === 0) {
        sanitized = 'file';
    }
    
    // Check for reserved names (Windows)
    const nameWithoutExt = sanitized.split('.')[0].toUpperCase();
    if (RESERVED_NAMES.includes(nameWithoutExt)) {
        sanitized = 'file_' + sanitized;
    }
    
    // Limit filename length (255 chars max for most filesystems)
    if (sanitized.length > 255) {
        const ext = path.extname(sanitized);
        const nameWithoutExt = sanitized.substring(0, sanitized.length - ext.length);
        const maxNameLength = 255 - ext.length;
        sanitized = nameWithoutExt.substring(0, Math.max(1, maxNameLength)) + ext;
    }
    
    // Ensure filename doesn't start or end with dot or space
    sanitized = sanitized.replace(/^[\s.]+|[\s.]+$/g, '');
    
    if (!sanitized || sanitized.length === 0) {
        sanitized = 'file';
    }
    
    return sanitized;
};

// Allowed MIME types - strict whitelist
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
];

// Allowed file extensions (as backup validation)
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.mov'];

// Maximum file size: 10MB (consistent with client-side validation)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Function to validate file extension
const isValidExtension = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext);
};

// Function to validate MIME type
const isValidMimeType = (mimetype) => {
    return ALLOWED_MIME_TYPES.includes(mimetype.toLowerCase());
};

// Magic bytes (file signatures) for file type validation
// This prevents MIME type spoofing by checking actual file content
const FILE_SIGNATURES = {
    'image/jpeg': [
        [0xFF, 0xD8, 0xFF, 0xE0], // JPEG with JFIF
        [0xFF, 0xD8, 0xFF, 0xE1], // JPEG with EXIF
        [0xFF, 0xD8, 0xFF, 0xE2], // JPEG with ICC
        [0xFF, 0xD8, 0xFF, 0xDB], // JPEG raw
        [0xFF, 0xD8, 0xFF, 0xEE], // JPEG with Adobe
    ],
    'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    'image/gif': [
        [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
        [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
    ],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header (needs additional check)
    'video/mp4': [
        [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // MP4 variant 1
        [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], // MP4 variant 2
        [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70], // MP4 variant 3
    ],
    'video/webm': [[0x1A, 0x45, 0xDF, 0xA3]], // WebM
    'video/quicktime': [[0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74]], // QuickTime
};

// Function to check if buffer matches a signature
const matchesSignature = (buffer, signatures) => {
    for (const signature of signatures) {
        if (buffer.length < signature.length) continue;
        let matches = true;
        for (let i = 0; i < signature.length; i++) {
            if (buffer[i] !== signature[i]) {
                matches = false;
                break;
            }
        }
        if (matches) {
            // Additional check for WebP (must contain WEBP after RIFF)
            if (signature[0] === 0x52 && buffer.length >= 12) {
                const webpCheck = buffer.toString('ascii', 8, 12);
                if (webpCheck === 'WEBP') return true;
                return false;
            }
            return true;
        }
    }
    return false;
};

// Function to validate file content matches declared MIME type
const validateFileContent = (filePath, declaredMimeType) => {
    try {
        const buffer = fs.readFileSync(filePath);
        
        // Check if file is empty
        if (buffer.length === 0) {
            return { valid: false, reason: 'File is empty' };
        }
        
        // Get expected signatures for declared MIME type
        const expectedSignatures = FILE_SIGNATURES[declaredMimeType.toLowerCase()];
        if (!expectedSignatures) {
            // If we don't have a signature for this type, allow it but log
            console.warn(`No signature validation for MIME type: ${declaredMimeType}`);
            return { valid: true };
        }
        
        // Check if file matches expected signature
        if (!matchesSignature(buffer, expectedSignatures)) {
            return { 
                valid: false, 
                reason: `File content does not match declared type ${declaredMimeType}. Possible file type spoofing.` 
            };
        }
        
        return { valid: true };
    } catch (error) {
        return { valid: false, reason: `Error reading file: ${error.message}` };
    }
};

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save files in the "uploads" folder
    },
    filename: (req, file, cb) => {
        // Sanitize the filename and add a timestamp to avoid conflicts
        const sanitizedFilename = sanitizeFilename(file.originalname);
        const timestamp = Date.now();
        const ext = path.extname(sanitizedFilename) || path.extname(file.originalname) || '';
        cb(null, `${timestamp}-${sanitizedFilename}${ext ? '' : ext}`);
    },
});

// Enhanced file filter with multiple validation layers
const fileFilter = (req, file, cb) => {
    // Validate filename is not empty
    if (!file.originalname || file.originalname.trim().length === 0) {
        return cb(new Error('Filename is required'), false);
    }
    
    // Validate MIME type
    if (!isValidMimeType(file.mimetype)) {
        return cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, QuickTime)`), false);
    }
    
    // Validate file extension as backup
    if (!isValidExtension(file.originalname)) {
        return cb(new Error(`Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
    }
    
    // Additional check: ensure filename is safe (path traversal, null bytes, control chars)
    const sanitized = sanitizeFilename(file.originalname);
    if (sanitized === 'file' && file.originalname !== 'file') {
        return cb(new Error('Invalid filename: contains forbidden characters or reserved names'), false);
    }
    
    // Check for reserved Windows filenames
    const nameWithoutExt = file.originalname.split('.')[0].toUpperCase();
    if (RESERVED_NAMES.includes(nameWithoutExt)) {
        return cb(new Error('Invalid filename: reserved system name'), false);
    }
    
    cb(null, true); // Accept the file (content validation happens after upload)
};

const upload = multer({ 
    storage, 
    fileFilter, 
    limits: { 
        fileSize: MAX_FILE_SIZE,
        files: 10, // Maximum 10 files per request
        fieldSize: 10 * 1024 * 1024 // 10MB field size limit
    } 
});

// Security headers middleware for all responses
const setSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
};

// Apply security headers to all routes
app.use(setSecurityHeaders);

// Enable JSON parsing for API endpoints
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size

const sanitizeProjectId = (projectId) =>
  String(projectId || '').replace(/[^a-zA-Z0-9._-]/g, '');

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

// Rate limiting for Express server
const { createRateLimiter } = require('./api/utils/rateLimit');

// Rate limiters for different endpoints
const signatureLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 20, // 20 requests per minute
  message: 'Too many signature requests. Please try again in a minute.'
});

const configLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many configuration requests. Please try again in a minute.'
});

const spotifyLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many Spotify API requests. Please try again in a minute.'
});

const uploadLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 10, // 10 upload requests per minute (more restrictive due to file processing)
  message: 'Too many upload requests. Please try again in a minute.'
});

const projectEditsLimiter = createRateLimiter({
  windowMs: 60000,
  max: 60,
  message: 'Too many edit requests. Please try again in a minute.'
});

app.get('/api/project-edits/:projectId', projectEditsLimiter, async (req, res) => {
  const projectId = sanitizeProjectId(req.params.projectId);
  if (!projectId) {
    return res.status(400).json({ success: false, error: 'Invalid project id.' });
  }
  if (!supabase) {
    return res.status(503).json({ success: false, error: 'Supabase is not configured.' });
  }
  const { data, error } = await supabase
    .from('project_edits')
    .select('project_id, overview, language, image')
    .eq('project_id', projectId)
    .maybeSingle();
  if (error) {
    console.error('Failed to load project edits:', error);
    return res.status(500).json({ success: false, error: 'Failed to load project edits.' });
  }
  return res.status(200).json({ success: true, data: data || null });
});

app.post('/api/project-edits/:projectId/verify', projectEditsLimiter, (req, res) => {
  const projectId = sanitizeProjectId(req.params.projectId);
  if (!projectId) {
    return res.status(400).json({ success: false, error: 'Invalid project id.' });
  }
  if (req.body?.password !== projectEditPassword) {
    return res.status(401).json({ success: false, error: 'Invalid password.' });
  }
  return res.status(200).json({ success: true });
});

app.put('/api/project-edits/:projectId', projectEditsLimiter, async (req, res) => {
  const projectId = sanitizeProjectId(req.params.projectId);
  if (!projectId) {
    return res.status(400).json({ success: false, error: 'Invalid project id.' });
  }
  if (req.body?.password !== projectEditPassword) {
    return res.status(401).json({ success: false, error: 'Invalid password.' });
  }
  if (!supabase) {
    return res.status(503).json({ success: false, error: 'Supabase is not configured.' });
  }
  const { overview, language, image } = req.body || {};
  const updates = {};
  if (typeof overview === 'string') updates.overview = overview;
  if (typeof language === 'string') updates.language = language;
  if (typeof image === 'string' && image.length <= 5 * 1024 * 1024) {
    updates.image = image;
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, error: 'No valid fields to update.' });
  }
  const { data, error } = await supabase
    .from('project_edits')
    .upsert({ project_id: projectId, ...updates }, { onConflict: 'project_id' })
    .select('project_id, overview, language, image')
    .single();
  if (error) {
    console.error('Failed to save project edits:', error);
    return res.status(500).json({ success: false, error: 'Failed to save project edits.' });
  }
  return res.status(200).json({ success: true, data });
});

// Local signature endpoint for ImageKit direct upload
// ImageKit public configuration endpoint (public key and URL endpoint only)
app.get('/api/imagekit-config', configLimiter, (req, res) => {
  try {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !urlEndpoint) {
      return res.status(503).json({
        success: false,
        error: 'ImageKit configuration is not available.'
      });
    }

    // Return only public configuration (never private key)
    res.status(200).json({
      success: true,
      publicKey: publicKey,
      urlEndpoint: urlEndpoint
    });
  } catch (error) {
    console.error('Error retrieving ImageKit config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve ImageKit configuration.'
    });
  }
});

app.get('/api/signature', signatureLimiter, (req, res) => {
  const { errorResponse } = require('./api/utils/response');
  if (!imagekit) {
    return errorResponse(res, 
      process.env.NODE_ENV === 'production'
        ? 'Service configuration is unavailable. Please contact support.'
        : 'ImageKit not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env file',
      503
    );
  }
  const token = uuidv4();
  const expire = Math.floor(Date.now() / 1000) + 60 * 5; // 5 minutes from now
  const signature = imagekit.getAuthenticationParameters(token, expire);
  // Security: Don't log sensitive authentication data in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('ImageKit signature generated (debug mode only)');
  }
  res.status(200).json({
    signature: signature.signature,
    expire: signature.expire,
    token: signature.token
  });
});

// Spotify API endpoints (for local development)
// In production, these are handled by Vercel serverless functions in /api/spotify/
app.post('/api/spotify/token', spotifyLimiter, async (req, res) => {
  const { setCORSHeaders, handleOptions } = require('./api/utils/cors');
  const { successResponse, errorResponse } = require('./api/utils/response');
  
  setCORSHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
    return;
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

app.get('/api/spotify', spotifyLimiter, async (req, res) => {
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
      const { errorResponse } = require('./api/utils/response');
      // Sanitize Spotify API error messages to avoid leaking details
      const isProduction = process.env.NODE_ENV === 'production';
      const errorMsg = isProduction 
        ? 'External service request failed. Please try again later.'
        : (data.error?.message || 'Spotify API request failed');
      return errorResponse(res, errorMsg, spotifyResponse.status >= 500 ? 500 : spotifyResponse.status);
    }

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Spotify API proxy error:', error);
    // errorResponse will automatically sanitize the message in production
    return errorResponse(res, `Internal server error: ${error.message}`, 500);
  }
});

// ImageKit upload handler for /upload endpoint with enhanced validation
app.post('/upload', uploadLimiter, upload.array('media', 10), async (req, res) => {
  try {
    if (!imagekit) {
      return res.status(503).json({
        success: false,
        error: 'ImageKit not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env file'
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded.'
      });
    }
    
    // Additional validation: check file count
    if (req.files.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum 10 files allowed per request.'
      });
    }
    
    const uploadResults = [];
    const errors = [];
    
    for (const file of req.files) {
      try {
        // Additional server-side validation
        if (!isValidMimeType(file.mimetype)) {
          errors.push(`${file.originalname}: Invalid MIME type ${file.mimetype}`);
          // Clean up file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          continue;
        }
        
        if (!isValidExtension(file.originalname)) {
          errors.push(`${file.originalname}: Invalid file extension`);
          // Clean up file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          continue;
        }
        
        // Verify file size (double-check)
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.originalname}: File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
          // Clean up file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          continue;
        }
        
        // Sanitize filename before upload
        const sanitizedFilename = sanitizeFilename(file.originalname);
        const timestamp = Date.now();
        const ext = path.extname(file.originalname) || '';
        const finalFilename = `${timestamp}-${sanitizedFilename}${ext}`;
        
        // Log file info (sanitized)
        console.log('Uploading file:', finalFilename, 'Type:', file.mimetype, 'Size:', file.size);
        
        // Read file and verify it exists
        if (!fs.existsSync(file.path)) {
          throw new Error('File not found on server');
        }
        
        const fileBuffer = fs.readFileSync(file.path);
        
        // Verify file buffer is not empty
        if (fileBuffer.length === 0) {
          throw new Error('File is empty');
        }
        
        // Validate file content matches declared MIME type (prevent MIME type spoofing)
        const contentValidation = validateFileContent(file.path, file.mimetype);
        if (!contentValidation.valid) {
          errors.push(`${file.originalname}: ${contentValidation.reason}`);
          // Clean up file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          continue;
        }
        
        // Upload to ImageKit with sanitized filename
        const result = await imagekit.upload({
          file: fileBuffer,
          fileName: finalFilename,
          folder: '/Upload_M-O-M'
        });
        
        console.log('ImageKit upload result:', result.fileId);
        
        if (!result.url || !result.fileId) {
          throw new Error('ImageKit did not return a valid URL or fileId');
        }
        
        uploadResults.push({
          originalname: file.originalname,
          filename: finalFilename,
          url: result.url,
          fileId: result.fileId,
          type: result.type,
          size: file.size
        });
      } catch (ikErr) {
        console.error('Failed to upload to ImageKit:', ikErr);
        // Don't expose internal error details to client
        errors.push(`${file.originalname}: Upload failed`);
      } finally {
        // Always delete the local file
        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkErr) {
            console.error('Failed to delete temporary file:', unlinkErr);
          }
        }
      }
    }
    
    // Return results with any errors
    if (uploadResults.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files were successfully uploaded.',
        errors: errors
      });
    }
    
    res.status(200).json({
      success: true,
      message: `${uploadResults.length} file(s) uploaded successfully.`,
      files: uploadResults,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('ImageKit upload error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error during upload.'
    });
  }
});

// Error handling for file uploads with security headers
app.use((err, req, res, next) => {
    // Apply security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    if (err instanceof multer.MulterError) {
        // Handle Multer errors (e.g., file size limit exceeded)
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
            });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Too many files. Maximum 10 files allowed per request.'
            });
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: 'Unexpected file field. Use "media" field for file uploads.'
            });
        }
        return res.status(400).json({
            success: false,
            error: 'File upload error. Please check file type and size.'
        });
    } else if (err) {
        // Handle other errors (e.g., invalid file type)
        // Don't expose internal error details
        return res.status(400).json({
            success: false,
            error: 'File upload validation failed. Please check file type and size.'
        });
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
