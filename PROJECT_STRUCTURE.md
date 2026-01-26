# Project Structure

This document summarizes the high-level layout of `Mnmnts-website` and the role of each major folder.

## Top-Level Overview

- `api/` - Serverless-style API routes for ImageKit uploads and Spotify proxy.
- `assets/` - Shared static assets (images, videos, fonts, styles, scripts, resume PDF).
- `gallery/` - Main gallery page (homepage).
- `know-me/` - About page.
- `image-upload/` - Upload page and UI.
- `Repository/` - Astro-based Repository (Archive) site with project pages.
- `spotify-visualiser/` - Spotify visualizer app (Vite + React).
- `ElasticGridScroll/` - Extended gallery view (linked from gallery).
- `Menu-new/` - Unified navigation component.
- `server.js` - Express server for local dev + API endpoints.
- `vercel.json` - Vercel rewrites/headers for deployment.

## Detailed Structure

```
Mnmnts-website/
├── api/
│   ├── README.md
│   ├── index.js
│   ├── signature.js
│   ├── spotify/
│   │   ├── index.js
│   │   └── token.js
│   └── utils/
│       ├── cors.js
│       ├── rateLimit.js
│       └── response.js
├── assets/
│   ├── fonts/
│   ├── images/
│   │   └── gallery-data.json
│   ├── videos/
│   │   └── videos-data.json
│   ├── pdfjs/
│   ├── resume/
│   │   └── karthik_resume.pdf
│   ├── scripts/
│   └── styles/
├── gallery/
│   └── index.html
├── know-me/
│   ├── about.html
│   ├── about.css
│   └── about.js
├── image-upload/
│   ├── upload.html
│   └── upload.css
├── Repository/
│   ├── src/
│   ├── public/
│   ├── dist/
│   └── README.md
├── spotify-visualiser/
│   ├── src/
│   ├── public/
│   ├── dist/
│   ├── vite.config.js
│   └── README docs
├── ElasticGridScroll/
├── Menu-new/
├── server.js
├── vercel.json
├── README.md
└── package.json
```

## Notes

- The main site is served from the project root via `server.js`.
- The Repository (`/repo`) and Spotify Visualizer (`/spotify-visualiser`) are built apps served from their `dist/` folders.
- Content for gallery images/videos is driven by JSON files in `assets/images/` and `assets/videos/`.

