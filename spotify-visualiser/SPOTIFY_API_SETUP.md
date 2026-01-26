# Spotify API Setup

This document explains how to connect the visualiser to the Spotify Web API.

## Required Environment Variables

**Backend (serverless / local server):**
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

**Frontend (visualiser):**
- `VITE_SPOTIFY_CLIENT_ID`

## Redirect URIs

Add these in your Spotify Developer app:
- `http://localhost:5173/spotify-visualiser/`
- `http://localhost:3000/spotify-visualiser/`
- `https://yourdomain.com/spotify-visualiser/`

## Local Audio Fallback

If you want to keep local audio:
1. Place files in `spotify-visualiser/public/audio/`
2. Update the `playlist` array in `spotify-visualiser/src/components/MusicPlayer.tsx`

The visualiser can switch between **Spotify Mode** and **Local Mode**.
