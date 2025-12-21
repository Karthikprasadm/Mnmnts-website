# Security Documentation

## Overview

This portfolio website is **READ-ONLY**. Only the website owner can make changes to content. All content is served from static JSON files.

**Note**: API and WebSocket features have been temporarily removed and will be re-implemented in the future.

## API Security

**Note**: API functionality has been temporarily removed. This section is kept for future reference.

When API features are re-implemented, they will include:
- Read-only enforcement (GET requests only)
- CORS configuration
- Security headers on all responses

## Service Worker Security

### Background Sync Restrictions

- **Form Submissions**: Only allowed to authorized endpoints (ImageKit signature)
- **Unauthorized endpoints**: Automatically blocked and removed from queue

### Cache Security

- Only caches GET requests
- Skips caching of:
  - Upload endpoints
  - Signature endpoints
  - Any endpoint with sensitive data

## WebSocket Security

**Note**: WebSocket functionality has been temporarily removed. This section is kept for future reference.

When WebSocket features are re-implemented, they will include:
- Admin token authentication for write operations
- Secure connection handling
- Activity logging and monitoring

## Client-Side Security

### LocalStorage

- Archive page uses localStorage for user-added projects
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

### Required for ImageKit Signature

```bash
# Vercel (ImageKit Signature Endpoint)
IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key
IMAGEKIT_URL_ENDPOINT=your-url-endpoint
```

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
- WebSocket connection attempts logged
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

