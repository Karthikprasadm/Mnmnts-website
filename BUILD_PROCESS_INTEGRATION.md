# Build Process Integration Documentation

This document describes the build processes for all projects in the repository and how they integrate together.

## Overview

The repository contains multiple projects with different build processes:

1. **Main Website** - Static HTML/CSS/JS (no build process)
2. **Spotify Visualiser** (`spotify-visualiser/`) - Vite + TypeScript build
3. **ElasticGridScroll** - Static demo (no build process)

---

## Build Processes by Project

### 1. Main Website

**Location:** Root directory  
**Build Process:** None (static files)  
**Deployment:** Direct push to GitHub Pages

**Files:**
- `gallery/index.html`
- `know-me/about.html`
- `image-upload/upload.html`
- `assets/` (scripts, styles, images, videos)
- `sw.js` (service worker)
- `manifest.json` (PWA manifest)

**Deployment Steps:**
1. Edit files directly
2. Commit and push to the `modern-ui` branch
3. GitHub Pages automatically deploys

---

### 2. Spotify Visualiser (`spotify-visualiser/`)

**Location:** `spotify-visualiser/` directory  
**Build Tool:** Vite + TypeScript  
**Output:** `spotify-visualiser/dist/` (committed as build output and served from `/spotify-visualiser/`)

#### Build Commands

```bash
cd spotify-visualiser
npm install           # Install dependencies
npm run dev           # Development server (localhost:5173)
npm run build         # Build for production (outputs to dist/)
```

#### Build Process

1. **TypeScript Compilation:** TypeScript files compiled to JavaScript
2. **Vite Bundling:** Assets bundled and optimized
3. **Output:** Generated to `dist/` directory
4. **Deployment:** Commit `dist/` contents under `spotify-visualiser/` (they are served directly from `/spotify-visualiser/` by GitHub Pages and by `server.js`, which points to `spotify-visualiser/dist`).

#### Integration with Main Website

- **Navigation:** Linked from main site navigation menu
- **Sitemap:** Listed in root `sitemap.xml`
- **API:** **None required** – visualiser uses only local images and audio files (no Spotify API calls)

---

### 3. ElasticGridScroll

**Location:** `ElasticGridScroll/` directory  
**Build Process:** None (static demo files)  
**Deployment:** Direct push to GitHub Pages

**Files:**
- `index.html`, `index2.html`, `index3.html`, `index4.html` (demo versions)
- `assets/` (WebP images)
- `css/` (styles)
- `js/` (scripts and libraries)

#### Integration with Main Website

- **Linked From:** Gallery "view more" button (`assets/scripts/script.js` line 164)
- **URL:** `/ElasticGridScroll/index.html`
- **Sitemap:** Now included in root `sitemap.xml`

---

## Complete Build Workflow

### For Full Site Deployment

If you need to rebuild all projects:

```bash
# 1. Main website (no build needed)
# - Just commit and push

# 2. Spotify Visualiser (if updated)
cd spotify-visualiser
npm run build
# Copy dist/ contents to spotify-visualiser/ root
cd ..

# 3. Commit and push all changes
git add .
git commit -m "Rebuild all projects"
git push origin modern-ui
```

### For Spotify Visualiser Updates

```bash
cd spotify-visualiser
npm run build
cd ..
git add spotify-visualiser/dist
git commit -m "Update Spotify Visualiser build"
git push origin modern-ui
```

---

## Build Dependencies

### Node.js Version

- **Required:** Node.js 18+ for all projects
- **Recommended:** Node.js 20+ (LTS)

### Package Managers

- **npm** - Used by all projects
### Build Tools

- **Vite** - Used by spotify-visualiser/
- **TypeScript** - Used by spotify-visualiser/

---

## Deployment Integration

### GitHub Pages

All projects deploy to GitHub Pages automatically:

1. **Main Website:** Root directory → `https://karthikprasadm.github.io/`
2. **Spotify Visualiser:** `spotify-visualiser/` → `https://karthikprasadm.github.io/spotify-visualiser/`
3. **ElasticGridScroll:** `ElasticGridScroll/` → `https://karthikprasadm.github.io/ElasticGridScroll/`

### Vercel (API Endpoints)

- **API Endpoints:** Deploy to Vercel for serverless functions
- **Endpoints:** `/api/signature`
- **Environment Variables:** Set in Vercel dashboard

---

## Troubleshooting

### Spotify Visualiser Build Issues

**Problem:** TypeScript compilation errors  
**Solution:**
- Check `tsconfig.json` configuration
- Verify all imports are correct
- Check for missing dependencies

**Problem:** Assets not loading after build  
**Solution:**
- Verify `vite.config.js` base path is `/spotify-visualiser/`
- Check that assets are in `public/` directory
- Verify paths in HTML files

---

## Best Practices

1. **Testing:** Test locally before pushing to production
2. **Documentation:** Update this document if build processes change
3. **Version Control:** Commit build outputs to git
4. **Environment Variables:** Never commit `.env` files, set in deployment platform

---

## Future Improvements

1. **Automated Build Script:** Create root-level script to build all projects
2. **GitHub Actions:** Set up CI/CD to auto-build on push
3. **Build Verification:** Add automated tests for build outputs
4. **TypeScript Migration:** Consider migrating main project to TypeScript

---

**Last Updated:** Based on current project structure  
**Maintained By:** Project maintainer
