# API Setup Guide

## Current API Endpoints

The project currently has one active API endpoint:

### `/api/signature` (ImageKit Signature)
- **Purpose**: Secure ImageKit authentication for direct uploads
- **Used by**: `image-upload/upload.html`
- **Method**: GET
- **Security**: CORS restricted, security headers applied

## Configuration

To use the ImageKit signature endpoint, set these environment variables:

```env
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint
```

See `.env.example` for a template.

## Removed API Features

The following API features have been removed:
- Portfolio API endpoints (gallery, about, portfolio, projects, social) - Data now loaded from JSON files
- Spotify API proxy - Visualiser now uses local audio files
- WebSocket server - Functionality completely removed

## Current Data Loading

The website loads data directly from JSON files:
- `assets/images/gallery-data.json` - Gallery images
- `assets/videos/videos-data.json` - Gallery videos

See the main [README.md](./README.md) for current content management instructions.
