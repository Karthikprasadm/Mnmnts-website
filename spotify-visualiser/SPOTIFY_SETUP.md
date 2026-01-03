# Spotify Web API Integration Setup

This guide explains how to set up Spotify Web API integration for the music player.

## Prerequisites

1. **Spotify Developer Account**: Create an account at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. **Node.js**: Version 18+ required
3. **Backend Server**: Either local development server or Vercel deployment

## Step 1: Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **"Create App"**
3. Fill in:
   - **App Name**: `Mnmnts Spotify Visualizer` (or your preferred name)
   - **App Description**: `Music visualizer with Spotify integration`
   - **Redirect URI**: 
     - For local development: `http://localhost:5173/spotify-visualiser/`
     - For production: `https://yourdomain.com/spotify-visualiser/`
   - **Website**: Your website URL
4. Accept the terms and click **"Save"**
5. Copy your **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

### Local Development

Create a `.env` file in the **root directory** of your project:

```env
# Spotify API Credentials
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

### Frontend (Spotify Visualizer)

Create a `.env` file in the `spotify-visualiser/` directory:

```env
# Spotify Client ID (public, safe to expose)
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
```

**Note**: The Client ID is safe to expose in frontend code. The Client Secret should **NEVER** be exposed and must only be used in backend code.

### Production (Vercel)

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   - `SPOTIFY_CLIENT_ID` = Your Client ID
   - `SPOTIFY_CLIENT_SECRET` = Your Client Secret
   - `VITE_SPOTIFY_CLIENT_ID` = Your Client ID (for frontend)

## Step 3: Update Redirect URIs

In your Spotify App settings, add all redirect URIs you'll use:

- `http://localhost:5173/spotify-visualiser/` (Local dev)
- `http://localhost:3000/spotify-visualiser/` (Alternative local)
- `https://yourdomain.com/spotify-visualiser/` (Production)

## Step 4: Install Dependencies

The required dependencies are already in `package.json`. If you need to reinstall:

```bash
# Root directory
npm install

# Spotify visualizer directory
cd spotify-visualiser
npm install
```

## Step 5: Start Development Server

### Option 1: Using Root Server (Recommended for Full Integration)

```bash
# Root directory
npm start
# or
node server.js
```

This starts the backend server on `http://localhost:3000` which handles:
- Spotify token exchange (`/api/spotify/token`)
- Spotify API proxy (`/api/spotify`)

### Option 2: Using Vite Dev Server (Frontend Only)

```bash
cd spotify-visualiser
npm run dev
```

**Note**: For Option 2, you'll need to configure the API base URL in `spotify-visualiser/src/services/spotify.ts` to point to your backend.

## Step 6: Test the Integration

1. Open `http://localhost:5173/spotify-visualiser/` (or your configured URL)
2. Click **"Connect with Spotify"** button
3. Authorize the app in the Spotify login page
4. You should be redirected back and see **"Disconnect Spotify"** button
5. Toggle to **"Spotify Mode"** to use Spotify tracks
6. Your top tracks should load automatically

## Features

### Authentication
- OAuth 2.0 flow with Spotify
- Automatic token refresh
- Secure token storage (localStorage)

### Playback
- Spotify Web Playback SDK integration
- Play/pause controls
- Next/previous track
- Volume control
- Progress seeking

### Playlists
- Top tracks (short/medium/long term)
- Saved tracks
- User playlists
- Search tracks

## API Endpoints

### Backend Endpoints (Serverless Functions)

- `POST /api/spotify/token` - Exchange authorization code or refresh token
- `GET /api/spotify?endpoint=...` - Proxy requests to Spotify Web API

### Frontend Services

- `spotify.ts` - API service for Spotify Web API calls
- `useSpotifyPlayer.ts` - React hook for Spotify Web Playback SDK
- `SpotifyAuth.tsx` - Authentication component

## Troubleshooting

### "No valid access token" Error

- Check if you're logged in (click "Connect with Spotify")
- Verify `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are set correctly
- Check browser console for authentication errors

### "Player not ready" Error

- Ensure Spotify Web Playback SDK script is loaded (check `index.html`)
- Verify you have an active Spotify Premium subscription (required for Web Playback SDK)
- Check browser console for SDK initialization errors

### CORS Errors

- Verify backend CORS settings in `api/utils/cors.js`
- Ensure redirect URI matches exactly in Spotify App settings
- Check that backend server is running and accessible

### Token Refresh Issues

- Tokens are automatically refreshed when expired
- If refresh fails, user will need to re-authenticate
- Check backend logs for token refresh errors

## Security Notes

1. **Never commit** `.env` files or expose `SPOTIFY_CLIENT_SECRET`
2. **Client ID** is safe to expose in frontend code
3. **Client Secret** must only be used in backend/serverless functions
4. Tokens are stored in `localStorage` (consider more secure storage for production)
5. Always use HTTPS in production

## Production Deployment

### Vercel

1. Set environment variables in Vercel dashboard
2. Deploy the project
3. Update redirect URI in Spotify App settings to match production URL
4. Rebuild and redeploy if needed

### Other Platforms

- Ensure environment variables are set correctly
- Update redirect URIs in Spotify App settings
- Verify backend API endpoints are accessible
- Test authentication flow end-to-end

## Support

For issues or questions:
- Check [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- Review [Spotify Web Playback SDK Guide](https://developer.spotify.com/documentation/web-playback-sdk)
- Check browser console and server logs for errors

