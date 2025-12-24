# Security Documentation

## Overview

This portfolio website is **READ-ONLY**. Only the website owner can make changes to content. All content is served from static JSON files.

**Note**: Portfolio API features have been removed. The website loads data directly from JSON files. WebSocket functionality has been removed.

## Active Project Folders

The following folders are actively used and should be kept:
- `api/` - Backend API endpoints (ImageKit signature)
- `assets/` - Main website assets (fonts, styles, scripts, images, videos)
- `ElasticGridScroll/` - Extended gallery view (linked from gallery "view more" button)
- `gallery/` - Main gallery page (homepage)
- `image-upload/` - Image upload page
- `know-me/` - About page
- `spotify-visualiser/` - Spotify Visualizer project
- `favicon/`, `404_error/`, `Images_for_icon/`, `icons8-baby-yoda-color-favicons/` - Required assets

## API Security

**Current State**: Portfolio API endpoints have been removed. Only utility endpoints remain.

### Active API Endpoints

1. **`/api/signature`** (ImageKit Signature)
   - Used by: `image-upload/upload.html`
   - Method: GET
   - Security: CORS restricted, security headers applied
   - Purpose: Secure ImageKit authentication for direct uploads

### Removed Endpoints

Portfolio API endpoints (gallery, about, portfolio, projects, social) have been removed. The website loads data directly from JSON files.

## Service Worker Security (optional)

### Background Sync Restrictions

- **Form Submissions**: Only allowed to authorized endpoints (ImageKit signature)
- **Unauthorized endpoints**: Automatically blocked and removed from queue

### Cache Security

- Only caches GET requests
- Skips caching of:
  - Upload endpoints
  - Signature endpoints
  - Any endpoint with sensitive data

## Client-Side Security

### LocalStorage

- Some pages may use localStorage for client-side preferences
- This is **client-side only** and doesn't affect the website
- Data is stored locally in the user's browser
- No server-side persistence

### Content Modification

- **No client-side content modification** is possible
- All content is served from static JSON files
- JavaScript cannot modify server-side content

## File System Security

### GitHub Repository

- Only repository owner can push changes
- Protected branches (if configured)
- All changes require authentication

### Deployment

- Vercel deployments require authentication
- GitHub Pages requires repository access
- No public write access to deployed files

## Best Practices

1. **Never expose write endpoints** without authentication
2. **Always validate** all input data
3. **Use HTTPS** in production
4. **Keep tokens secret** - never commit to repository
5. **Monitor logs** for unauthorized access attempts
6. **Regular security audits** of dependencies

## Environment Variables

### Required Environment Variables

```bash
# Vercel (ImageKit Signature Endpoint)
IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key
IMAGEKIT_URL_ENDPOINT=your-url-endpoint
```

### Legacy Environment Variables (No Longer Used)

The following environment variables were previously used for the Spotify API proxy but are **no longer required**:

- `SPOTIFY_CLIENT_ID` - Removed (Spotify API proxy has been removed)
- `SPOTIFY_CLIENT_SECRET` - Removed (Spotify API proxy has been removed)

The visualiser now uses only local audio files and does not connect to Spotify.

### Never Commit

- Admin tokens
- API keys
- Private keys
- Passwords

## Monitoring

### What to Monitor

- Unauthorized API access attempts
- Failed authentication attempts
- Unusual traffic patterns
- Write operation attempts

### Logging

- All unauthorized write attempts are logged
- API method violations logged

## Incident Response

If unauthorized access is detected:

1. **Immediately revoke** any compromised tokens
2. **Review logs** for access patterns
3. **Update security** measures
4. **Notify users** if data was affected
5. **Document** the incident

## Compliance

- **Read-Only API**: No user data collection
- **No Write Operations**: No data modification risk
- **Static Content**: All content is version-controlled
- **Transparent**: All code is open source (if repository is public)

## Contact

For security concerns:
- Email: wingspawn28@gmail.com
- GitHub: [Karthikprasadm](https://github.com/Karthikprasadm)

