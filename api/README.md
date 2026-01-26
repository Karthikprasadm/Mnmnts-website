# API Documentation

## Current API Endpoints

This directory contains only utility API endpoints, not portfolio data endpoints.

### Active Endpoints

1. **`/api/signature`** (`signature.js`)
   - ImageKit upload signature generation
   - Used by: `image-upload/upload.html`
   - Method: GET
   - Purpose: Secure ImageKit authentication for direct uploads

> **Note:** `/api/spotify/*` endpoints are active and used by the `spotify-visualiser/` app for Spotify Web API access.

## Spotify API Endpoints

### Active Endpoints

- `POST /api/spotify/token` - Exchange auth code or refresh token
- `GET /api/spotify?endpoint=...` - Proxy requests to Spotify Web API

These endpoints require:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

## Portfolio API - Removed

**Portfolio API endpoints have been removed** as documented in the main README. The website loads data directly from JSON files:
- `assets/images/gallery-data.json` - Gallery images
- `assets/videos/videos-data.json` - Gallery videos

## Future Implementation

If portfolio API features are re-implemented in the future, they will provide:
- RESTful endpoints for portfolio data
- Read-only access (GET requests only)
- Proper security headers and CORS configuration
- Centralized data management

See the main [README.md](../README.md) for current content management instructions.
