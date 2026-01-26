# Architecture Overview

This document explains the high-level flow and how the major parts of `Mnmnts-website` connect.

## High-Level Flow

1. **Browser requests a page**
   - Main site pages are served from the project root (HTML/CSS/JS).
   - `/repo` serves the Astro-built Repository site.
   - `/spotify-visualiser` serves the Vite-built Spotify visualizer app.

2. **Static assets load**
   - Shared assets (styles, scripts, fonts, JSON data, resume PDF) are in `assets/`.
   - Gallery images/videos are driven by JSON in `assets/images/` and `assets/videos/`.

3. **Client-side scripts enhance the UI**
   - Gallery, transitions, tooltips, menus, and interactions are handled in `assets/scripts/`.
   - Repository-specific enhancements are in `Repository/src/scripts/` and compiled to `Repository/public/scripts/`.

4. **API routes handle secure server tasks**
   - `/api/signature` provides ImageKit signatures for secure uploads.
   - `/api/spotify/*` handles Spotify token exchange and proxying.
   - `/api/project-edits/*` reads/writes project edits to Supabase.

## Main Components

### 1) Main Site (HTML/CSS/JS)
- **Pages:** `gallery/`, `know-me/`, `image-upload/`
- **Assets:** `assets/styles/`, `assets/scripts/`, `assets/images/`, `assets/videos/`
- **Resume modal:** Loads `assets/resume/karthik_resume.pdf` in an iframe.

### 2) Repository (Archive) — Astro
- **Location:** `Repository/`
- **Entry:** `Repository/src/pages/index.astro`
- **Project pages:** `Repository/src/pages/projects/[project_id].astro`
- **Data:** GitHub repos fetched at build time + runtime overrides from Supabase
- **Overrides:** `projectImageOverrides.js` fetches edits and updates grid tiles.

### 3) Spotify Visualizer — Vite + React
- **Location:** `spotify-visualiser/`
- **Auth:** OAuth via Spotify API
- **API:** Calls `/api/spotify/token` then uses proxy endpoints for playback data.

### 4) Server + APIs — Express
- **Entry:** `server.js`
- **Static:** Serves root site, `Repository/dist`, and `spotify-visualiser/dist`
- **APIs:** ImageKit, Spotify, and Supabase endpoints

## Data & Integration Map

```
Browser
  ├─ Main site (root HTML)
  │   └─ assets/ (styles/scripts/images/videos/resume)
  ├─ /repo (Astro build)
  │   ├─ GitHub API (build time)
  │   └─ /api/project-edits (runtime overrides from Supabase)
  └─ /spotify-visualiser (Vite build)
      └─ /api/spotify (token exchange + proxy)
```

## Deployment

- **Vercel** handles:
  - Static hosting of the main site
  - `Repository/dist` and `spotify-visualiser/dist` via rewrites
  - Serverless-style API routes in `/api`
  - Environment variables for Supabase, Spotify, and ImageKit

## Key Environment Variables

- **ImageKit:** `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`
- **Supabase:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PROJECT_EDIT_PASSWORD`
- **Spotify:** `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `VITE_SPOTIFY_CLIENT_ID`


