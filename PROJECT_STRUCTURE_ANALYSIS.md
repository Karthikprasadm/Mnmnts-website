# Complete Project Structure Analysis

## Overview
This is a comprehensive analysis of the entire `Mnmnts-website` project, covering all folders, subfolders, files, and subfiles.

## Project Type
**Multi-project repository** containing:
1. Main portfolio website (static HTML/CSS/JS)
2. Spotify Visualiser (Three.js/WebGL project) - **ACTIVE**
3. ElasticGridScroll (extended gallery view) - **ACTIVE** (linked from gallery)
4. API endpoints (Vercel serverless functions) - **ACTIVE**
5. WebSocket server - **REMOVED** (functionality removed)

---

## 📁 Root Directory Structure

### Configuration Files
- **`.gitignore`** - Git ignore rules (node_modules, uploads, .env files)
- **`.env.example`** - Environment variables template
- **`package.json`** - Main project dependencies (Express, ImageKit, Multer, CORS)
- **`package-lock.json`** - Dependency lock file
- **`LICENSE`** - All Rights Reserved (proprietary)
- **`sitemap.xml`** - XML sitemap for SEO (5 main pages)
- **(Removed)** `Procfile` - legacy Heroku config; no longer present

### Main HTML Files
- **`index.html`** - Root redirect page (redirects to `gallery/index.html`)
- **`404.html`** - Custom 404 error page with SEO metadata
- **`offline.html`** - Service worker offline fallback page (optional; used only if SW enabled)
- **`manifest.json`** - PWA manifest for mobile app installation

### Server Files
- **`server.js`** - Express.js server (port 3000) for local development
  - ImageKit integration for file uploads
  - Static file serving
  - Multer for file handling
  - CORS configuration
- **`custom-server.js`** - Alternative Express server (port 8000) for static serving
- **`signature-server.js`** - Standalone ImageKit signature server (port 5000)

### Documentation Files
- **`README.md`** - Main project documentation (Museum of Moments)
- **`README_SECURITY.md`** - Security quick reference
- **`SECURITY.md`** - Detailed security documentation
- **`API_SETUP.md`** - API setup guide (ImageKit signature endpoint)
- **`SERVICE_WORKER_GUIDE.md`** - Service worker documentation
- **`GLOBAL_VARIABLES_INIT.md`** - Global variable initialization order
- **`BUILD_PROCESS_INTEGRATION.md`** - Current build/deploy flows
- **`LOCAL_DEVELOPMENT.md`** - Local dev quickstart
- **`BACKEND_PROXY_SETUP.md`** - Legacy Spotify proxy (historical only)

### Service Worker (optional)
- **`sw.js`** - Enhanced service worker (519 lines)
  - Offline support
  - Background sync
  - Cache management (3 cache types)
  - Image caching
  - Queue management

---

## 📁 `/api/` - API Endpoints (Vercel Serverless Functions)

### Structure (current)
```
api/
├── index.js          # Health check endpoint
├── signature.js      # ImageKit signature endpoint (ACTIVE)
├── README.md         # Notes that other APIs were removed
└── utils/
    ├── cors.js
    └── response.js
```

### Status
- **Active**: `signature.js` (ImageKit authentication)
- **Removed**: gallery/about/portfolio/projects/social endpoints and related helpers (auth, data-loader). Data now loads from JSON files as documented in README/API_SETUP.

---

## 📁 `/assets/` - Static Assets

### Structure
```
assets/
├── fonts/
│   ├── fonts.css              # Font face declarations
│   ├── montserrat-400-latin.woff2
│   ├── montserrat-400.ttf
│   ├── montserrat-600-latin.woff2
│   ├── montserrat-600.ttf
│   ├── playfair-400-latin.woff2
│   ├── playfair-400.ttf
│   ├── playfair-600-latin.woff2
│   └── playfair-600.ttf
├── images/
│   ├── gallery-data.json      # Gallery images data (4 images + default)
│   └── README.md              # Gallery data documentation
├── videos/
│   ├── videos-data.json       # Gallery videos data (1 video)
│   └── README.md              # Videos data documentation
├── pdfjs/
│   ├── pdf.min.js             # PDF.js library
│   ├── pdf.worker.min.js      # PDF.js worker
│   ├── pdf.worker.min.mjs     # PDF.js worker (ES module)
│   └── pdf_viewer.min.css     # PDF viewer styles
├── resume/
│   └── karthik_resume.pdf     # Resume PDF file
├── scripts/
│   ├── script.js              # Main gallery script (547 lines)
│   ├── sw-utils.js            # Service worker utilities (241 lines)
│   ├── error-handler.js       # Error handling (141 lines)
│   ├── logger.js              # Logging utility (54 lines)
│   ├── global-error-handler.js # Global error boundary
│   └── tooltips.js            # Tooltip initialization
└── styles/
    ├── galaxy.css             # Main stylesheet (1242 lines)
    ├── icons.css              # Icon system (43 lines)
    └── styles.css             # Additional styles
```

### Key Files
- **`gallery-data.json`**: Contains 4 gallery images + 1 default image (ImageKit URLs)
- **`videos-data.json`**: Contains 1 video entry
- **`script.js`**: Main gallery functionality (image/video display, slideshow, thumbnails)
- **`galaxy.css`**: Comprehensive styling with galaxy background, glassmorphism, animations

---

## 📁 `/gallery/` - Main Gallery Page

### Files
- **`index.html`** (597 lines)
  - Main gallery page with image/video display
  - Preloads critical resources
  - SEO metadata and JSON-LD structured data
  - Service worker registration
  - Gallery script integration

---

## 📁 `/know-me/` - About Page

### Files
- **`about.html`** (520 lines)
  - Personal about page
  - SEO metadata
  - JSON-LD Person schema
  - Resume viewer integration
- **`about.css`** - About page specific styles
- **`about.js`** - About page JavaScript (minimal, 12 lines)

---

## 📁 `/image-upload/` - Upload Interface

### Files
- **`upload.html`** (743 lines)
  - ImageKit upload interface
  - Drag & drop functionality
  - Progress indicators
  - Form validation
- **`upload.css`** (444 lines)
  - Upload page styling
  - Glassmorphism design
  - Responsive layout

---

## 📁 `/ElasticGridScroll/` - Extended Gallery View (ACTIVE)

### Overview
Codrops demo project for elastic grid scroll effect. **ACTIVE** - Linked from gallery "view more" button.

### Integration
- **Linked from**: Gallery page via "view more" button
- **Location**: `assets/scripts/script.js` line 164
- **URL**: `../ElasticGridScroll/index.html`
- **Purpose**: Extended image viewing with elastic grid scroll animations

### Structure
```
ElasticGridScroll/
├── .gitattributes
├── .gitignore
├── LICENSE                     # MIT License
├── README.md                   # Demo documentation
├── favicon.ico
├── index.html                  # Demo 1
├── index2.html                 # Demo 2
├── index3.html                 # Demo 3
├── index4.html                 # Demo 4
├── assets/                     # 40 WebP images
├── css/
│   └── base.css               # Base styles
└── js/
    ├── gsap.min.js            # GSAP library
    ├── imagesloaded.pkgd.min.js
    ├── ScrollSmoother.min.js
    ├── ScrollTrigger.min.js
    ├── smoothscroll.js
    ├── utils.js
    └── demo1/                 # Demo-specific scripts
        └── index.js
```

---

## 📁 `/spotify-visualiser/` - Three.js Project

### Overview
TypeScript + Three.js project for Spotify visualizations using WebGL shaders.

### Structure
```
spotify-visualiser/
├── .gitignore
├── package.json               # Vite, Three.js, GSAP, Tailwind
├── package-lock.json
├── tsconfig.json
├── vite.config.js             # Vite config with GLSL plugin
├── index.html
├── public/
│   ├── 512/                   # 13 cover images (JPG)
│   ├── Aeonik TRIAL/          # 16 font files (OTF)
│   ├── covers/                # 30 cover images (JPG)
│   ├── spt-1-512.png
│   ├── spt-2.png
│   ├── spt-3.png
│   ├── visit-repo.svg
│   └── vite.svg
└── src/
    ├── canvas.ts              # Three.js canvas setup
    ├── main.ts                # App entry point
    ├── planes.ts              # Plane geometry
    ├── style.css              # Styles
    ├── shaders/
    │   ├── fragment.glsl      # Fragment shader
    │   └── vertex.glsl        # Vertex shader
    └── types/
        └── types.ts           # TypeScript types
```

### Tech Stack
- **Vite** - Build tool
- **Three.js** - 3D graphics
- **GSAP** - Animations
- **Lenis** - Smooth scrolling
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **GLSL** - Shader programming

---


## 📁 `/404_error/` - Error Assets

### Files
- **`error.gif`** - Animated error GIF

---

## 📁 `/favicon/` - Favicon Files

### Files (18 files)
- Multiple sizes for different platforms:
  - Android icons (36x36 to 192x192)
  - Apple touch icons (57x57 to 180x180)
  - MS tiles (70x70 to 310x310)
  - Standard favicons (16x16 to 96x96)
- **`browserconfig.xml`** - IE/Edge configuration
- **`manifest.json`** - Web app manifest

---

## 📁 `/icons8-baby-yoda-color-favicons/` - Alternative Favicons

### Files (18 PNG files)
- Baby Yoda themed favicons in various sizes

---

## 📁 `/Images_for_icon/` - Social Media Icons

### Files (5 PNG files)
- `github.png`
- `instagram.png`
- `linkedin.png`
- `pinterest.png`
- `spotify.png`

---

## 🔧 Build & Deployment

### Main Website
- **Local Dev**: `npm run dev` (Express server on port 3000)
- **Production**: GitHub Pages (static hosting)
- **Alternative**: Vercel deployment


### Spotify Visualiser
- **Dev**: `npm run dev` (Vite dev server)
- **Build**: `npm run build` (TypeScript compilation + Vite build)

---

## 📊 Project Statistics

### File Counts (Approximate)
- **Total Files**: 1000+ files
- **HTML Files**: ~100
- **JavaScript Files**: ~30
- **CSS Files**: ~10
- **Markdown Files**: ~180 (content)
- **Image Files**: ~300 (WebP, PNG, JPG)
- **Configuration Files**: ~20

### Technologies Used
1. **Frontend**: HTML5, CSS3, JavaScript (ES6+)
3. **Three.js**: v0.179.1 (for Spotify visualiser)
4. **GSAP**: v3.12.5 (animations)
5. **Lenis**: v1.1.17 (smooth scrolling)
6. **Vite**: v7.1.2 (build tool)
7. **TypeScript**: v5.8.3
8. **Express**: v5.1.0 (local server)
9. **ImageKit**: v6.0.0 (media hosting)

---

## 🔗 Inter-Project Relationships

### Main Website → ElasticGridScroll
- Gallery page links to ElasticGridScroll via "view more" button
- Provides extended image viewing experience
- Accessible at `/ElasticGridScroll/index.html`

### Main Website → API
- Uses `/api/signature` for ImageKit uploads
- Other API endpoints documented but inactive

### Main Website → Service Worker (optional)
- `sw.js` caches all main pages
- Background sync for uploads

---

## ⚠️ Known Issues & Notes

### Inactive Features
1. **API Endpoints**: Most API endpoints are documented but inactive (only signature and spotify proxy are active)
2. **WebSocket**: Removed completely

### Build Dependencies
1. **PowerShell**: Required for build scripts (Windows)

### Path Resolution
- Main site: Root-relative paths
- Both use `baseUrl` pattern for consistency

---

## 🎯 Key Features by Project

### Main Website
- ✅ Gallery with images/videos
- ✅ About page with resume viewer
- ✅ Image upload to ImageKit
- ✅ Service worker (offline support) — optional; site works online without it
- ✅ PWA capabilities — optional
- ✅ SEO optimization

- ✅ Artist showcase (28 artists)
- ✅ Album display (60+ albums)
- ✅ Search/Sort/Shuffle
- ✅ GSAP animations
- ✅ Smooth scrolling
- ✅ Responsive grid layouts

### Spotify Visualiser
- ✅ 3D WebGL visualizations
- ✅ GLSL shaders
- ✅ Three.js integration
- ✅ TypeScript type safety

---

## 📝 Documentation Files Summary

1. **README.md** - Main project overview
2. **SECURITY.md** - Security measures
3. **README_SECURITY.md** - Security quick reference
4. **API_SETUP.md** - API setup (ImageKit signature)
5. **SERVICE_WORKER_GUIDE.md** - Service worker docs
6. **GLOBAL_VARIABLES_INIT.md** - Global variable order
7. **BUILD_PROCESS_INTEGRATION.md** - Build/deploy integration
9. **LOCAL_DEVELOPMENT.md** - Local dev quickstart
10. **BACKEND_PROXY_SETUP.md** - Legacy Spotify proxy (historical)

---

## 🔄 Build Processes

### Main Website
- No build process (static HTML)
- Direct deployment to GitHub Pages from `modern-ui`

### Spotify Visualiser
1. Run `npm run build`
2. TypeScript compiles
3. Vite bundles assets
4. Output to `dist/`

---

## 🌐 Deployment Targets

1. **GitHub Pages**: Main site
2. **Vercel**: API endpoints (serverless functions)

---

## 📦 Dependencies Summary

### Main Project
- express, imagekit, multer, cors, dotenv, uuid

### Spotify Visualiser
- three, gsap, lenis, vite, typescript, tailwindcss, vite-plugin-glsl

---

## 🎨 Design System

### Colors
- Background: `#0a0a0a` (dark)
- Text: `#e0e0e0` (light gray)
- Accent: `#ffb347` (orange)
- Faded: `#888888` (gray)

### Typography
- Body: Montserrat (400, 600)
- Headings: Playfair Display (400, 600)

### Effects
- Glassmorphism: `rgba(30, 30, 30, 0.8)` with `blur(18px)`
- Galaxy background: External image with stars overlay
- Smooth transitions: `0.18s cubic-bezier(0.4, 0, 0.2, 1)`

---

## 🔐 Security Features

1. **CORS**: Restricted origins
2. **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
3. **Service Worker**: Authorized endpoint validation
4. **Read-Only API**: GET requests only
5. **ImageKit**: Secure signature endpoint

---

## 📈 Performance Features

1. **Service Worker Caching**: 3 cache types
2. **Preloading**: Critical CSS, fonts, scripts, JSON
3. **Lazy Loading**: Images loaded on demand
4. **Image Optimization**: ImageKit CDN with transformations
5. **Code Splitting**: Astro automatic code splitting

---

This analysis covers the complete project structure. All major directories, files, and their purposes have been documented.
