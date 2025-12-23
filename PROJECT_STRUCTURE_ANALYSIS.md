# Complete Project Structure Analysis

## Overview
This is a comprehensive analysis of the entire `Karthikprasadm.github.io` project, covering all folders, subfolders, files, and subfiles.

## Project Type
**Multi-project repository** containing:
1. Main portfolio website (static HTML/CSS/JS)
2. ArchiveUpdated project (Astro-based, music artist showcase) - **ACTIVE** - Source code
3. Archive directory (`archive/`) - Build output directory (contains generated `archive.html` from ArchiveUpdated/)
4. Spotify Visualiser (Three.js/WebGL project) - **ACTIVE**
5. ElasticGridScroll (extended gallery view) - **ACTIVE** (linked from gallery)
6. API endpoints (Vercel serverless functions) - **ACTIVE**
7. WebSocket server - **REMOVED** (functionality removed)

---

## 📁 Root Directory Structure

### Configuration Files
- **`.gitignore`** - Git ignore rules (node_modules, uploads, .env files)
- **`.env.example`** - Environment variables template
- **`package.json`** - Main project dependencies (Express, ImageKit, Multer, CORS)
- **`package-lock.json`** - Dependency lock file
- **`Procfile`** - Heroku deployment configuration (`web: node server.js`)
- **`LICENSE`** - All Rights Reserved (proprietary)
- **`sitemap.xml`** - XML sitemap for SEO (5 main pages)

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
- **`ARCHIVE_BUILD_SUMMARY.md`** - Archive build implementation summary
- **`ARCHIVE_BUILD_ANALYSIS.md`** - Archive build analysis report

### Service Worker (optional)
- **`sw.js`** - Enhanced service worker (519 lines)
  - Offline support
  - Background sync
  - Cache management (3 cache types)
  - Image caching
  - Queue management

---

## 📁 `/api/` - API Endpoints (Vercel Serverless Functions)

### Structure
```
api/
├── index.js                    # Health check endpoint
├── signature.js                # ImageKit signature endpoint (ACTIVE)
├── README.md                   # API documentation (notes API removed)
├── about/
│   └── index.js                # About endpoint
├── about.js                    # About endpoint (alternative)
├── gallery/
│   ├── images/
│   │   └── index.js           # Gallery images endpoint
│   ├── images.js              # Gallery images (alternative)
│   ├── videos/
│   │   └── index.js           # Gallery videos endpoint
│   └── videos.js              # Gallery videos (alternative)
├── portfolio/
│   └── index.js                # Portfolio endpoint
├── portfolio.js                # Portfolio endpoint (alternative)
├── projects/
│   └── index.js                # Projects endpoint
├── projects.js                 # Projects endpoint (alternative)
├── social/
│   └── index.js                # Social links endpoint
├── social.js                   # Social links (alternative)
└── utils/
    ├── auth.js                 # Authentication utilities
    ├── cors.js                 # CORS configuration
    ├── data-loader.js          # JSON file loader
    └── response.js             # Standardized response helpers
```

### Status
- **Active**: `signature.js` (ImageKit authentication)
- **Inactive**: All other endpoints (documented as "temporarily removed")
- **Pattern**: Each endpoint has both `/endpoint/index.js` and `/endpoint.js` versions

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

## 📁 `/archive/` - Archive Build Output Directory

### Overview
**Build output directory** - Contains generated files from ArchiveUpdated/ project. This directory contains the deployed archive website files, not source code.

**Note:** Source code is in `ArchiveUpdated/` directory. This directory contains the build output.

### Contents
- `archive.html` - Main archive page (generated from ArchiveUpdated/)
- `_astro/` - Compiled assets (JS, CSS, fonts)
- `favicon/`, `images/`, `icons/` - Static assets
- Artist pages, releases, history, store, contact pages (generated)

---

## 📁 `/ArchiveUpdated/` - Archive Project Source (ACTIVE)

### Overview
**ACTIVE ARCHIVE PROJECT** - This is the active version of the archive project currently used on the website. Source code for the Astro-based music artists/albums showcase.

**223 files total:**
- 88 Markdown files (content)
- 87 WebP images
- 22 Astro files

**Build Process:**
- Builds to `dist/` directory
- Output must be copied to `archive/` directory for deployment
- Generates `archive/archive.html` and related assets

### Structure
```
ArchiveUpdated/
├── .gitattributes
├── .github/
│   └── workflows/
│       └── astro.yml          # GitHub Pages deployment
├── .gitignore
├── astro.config.mjs           # Astro config (base: '/archive/')
├── package.json               # Same dependencies as archive/
├── package-lock.json
├── tsconfig.json
├── wrangler.jsonc             # Cloudflare Workers config
├── README.md                  # Project documentation (48 lines)
├── public/
│   ├── _headers
│   ├── favicon/               # 7 favicon files
│   ├── icons/                 # 5 social icons
│   ├── images/
│   │   ├── albums/            # 60+ album covers
│   │   └── artists/           # 28 artist images
│   └── playersclub-og.jpg
└── src/
    ├── assets/
    │   └── images/
    │       ├── arrow.svg
    │       └── cross.svg
    ├── components/             # 13 components (Header.astro removed)
    ├── data/
    │   ├── albums/            # 60+ album markdown files
    │   └── artists/           # 28 artist markdown files
    ├── layouts/
    │   └── BaseLayout.astro
    ├── pages/                 # Same structure as archive/
    ├── scripts/               # 6 JavaScript files
    └── styles/
        └── global.css
```

### Build Output

After running `npm run build`, the output in `dist/` must be copied to `archive/` directory:
- `dist/index.html` → `archive/archive.html`
- `dist/_astro/` → `archive/_astro/`
- `dist/favicon/` → `archive/favicon/`
- `dist/images/` → `archive/images/`
- `dist/icons/` → `archive/icons/`
- All subdirectories (artist pages, etc.)

### Key Features
- **28 artists** with individual pages
- **60+ albums** with detail pages
- **Search/Sort/Shuffle** functionality
- **GSAP animations** for page transitions
- **Lenis smooth scrolling**
- **Image preloading** with preloader component

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
    ├── spotify.ts             # Spotify integration
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

### Archive Project (ArchiveUpdated/)
- **Build Command**: `npm run build` (in ArchiveUpdated/)
- **Output**: Static HTML files in `dist/` → must be copied to `archive/` directory
- **Note**: `archive-backup/` is old version (not used)

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
2. **Astro**: v5.3.0 (for archive projects)
3. **Three.js**: v0.179.1 (for Spotify visualiser)
4. **GSAP**: v3.12.5 (animations)
5. **Lenis**: v1.1.17 (smooth scrolling)
6. **Vite**: v7.1.2 (build tool)
7. **TypeScript**: v5.8.3
8. **Express**: v5.1.0 (local server)
9. **ImageKit**: v6.0.0 (media hosting)

---

## 🔗 Inter-Project Relationships

### Main Website → Archive
- Main site links to `/archive/archive.html`
- Archive uses same design system (glassmorphism)
- Shared assets (favicons, some icons)

### ArchiveUpdated → Archive Directory
- ArchiveUpdated/ is the **source code** (active)
- Builds to `dist/` directory
- Output copied to `archive/` directory for deployment
- `archive/` contains build output, not source code


### Main Website → ElasticGridScroll
- Gallery page links to ElasticGridScroll via "view more" button
- Provides extended image viewing experience
- Accessible at `/ElasticGridScroll/index.html`

### Main Website → API
- Uses `/api/signature` for ImageKit uploads
- Other API endpoints documented but inactive

### Main Website → Service Worker (optional)
- `sw.js` caches all main pages
- Includes archive pages in cache
- Background sync for uploads

---

## ⚠️ Known Issues & Notes

### Inactive Features
1. **API Endpoints**: Most API endpoints are documented but inactive (only signature and spotify proxy are active)
2. **WebSocket**: Removed completely

### Build Dependencies
1. **Archive.html**: Must exist for "View all" links to work
2. **Base URL**: All archive projects use `/archive/` base path
3. **PowerShell**: Required for archive build scripts (Windows)

### Path Resolution
- Main site: Root-relative paths
- Archive projects: `/archive/` prefixed paths
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

### Archive Project (ArchiveUpdated/ - Active)
- ✅ Artist showcase (28 artists)
- ✅ Album display (60+ albums)
- ✅ Search/Sort/Shuffle
- ✅ GSAP animations
- ✅ Smooth scrolling
- ✅ Responsive grid layouts
- ✅ Build output in `archive/` directory

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
7. **GLOBAL_VARIABLES_INIT.md** - Global variable order
8. **ARCHIVE_BUILD_SUMMARY.md** - Archive build summary
9. **ARCHIVE_BUILD_ANALYSIS.md** - Archive build analysis
10. **archive/BUILD.md** - Archive build documentation
11. **ArchiveUpdated/README.md** - ArchiveUpdated docs

---

## 🔄 Build Processes

### Main Website
- No build process (static HTML)
- Direct deployment to GitHub Pages

### Archive Projects
1. Run `npm run build` in archive/ or ArchiveUpdated/
2. Astro generates static files to `dist/`
3. PowerShell script copies `dist/index.html` → `archive.html`
4. Script copies assets and subdirectories
5. Script updates paths in HTML files
6. Output ready for deployment

### Spotify Visualiser
1. Run `npm run build`
2. TypeScript compiles
3. Vite bundles assets
4. Output to `dist/`

---

## 🌐 Deployment Targets

1. **GitHub Pages**: Main site + archive projects
2. **Vercel**: API endpoints (serverless functions)
3. **Cloudflare Workers**: Archive projects (wrangler.jsonc)

---

## 📦 Dependencies Summary

### Main Project
- express, imagekit, multer, cors, dotenv, uuid

### Archive Projects
- astro, gsap, lenis, imagesloaded, @astrojs/sitemap, @fontsource-variable/instrument-sans

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
- Archive: Instrument Sans Variable

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
