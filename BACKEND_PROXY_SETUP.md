# Backend Proxy Setup (Legacy – Spotify API Removed)

> **Note:** The Spotify backend proxy and all related endpoints have been removed from this project.  
> This document is kept only for historical reference.

The current version of the site and the `spotify-visualiser/` project:

- Do **not** call `/api/spotify/*` at all.
- Do **not** require `SPOTIFY_CLIENT_ID` or `SPOTIFY_CLIENT_SECRET`.
- Do **not** use `spotify-visualiser/src/spotify.ts` (that file has been deleted).
- Play audio only from **locally hosted files** configured in `spotify-visualiser/src/components/MusicPlayer.tsx`.

If you ever decide to reintroduce a backend proxy for some other API in the future, you can reuse the patterns from this file and from git history (token endpoint, proxy endpoint, CORS helpers, etc.), but for now **no Spotify-related backend setup is needed or active.**
