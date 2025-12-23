# Build Process Integration Documentation

This document describes the build processes for all projects in the repository and how they integrate together.

## Overview

The repository contains multiple projects with different build processes:

1. **Main Website** - Static HTML/CSS/JS (no build process)
2. **ArchiveUpdated Project** (`ArchiveUpdated/`) - Astro-based, **ACTIVE** version, generates `archive.html` to `archive/` directory
3. **Spotify Visualiser** (`spotify-visualiser/`) - Vite + TypeScript build
4. **ElasticGridScroll** - Static demo (no build process)

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
2. Commit and push to `master` branch
3. GitHub Pages automatically deploys

---

### 2. ArchiveUpdated Project (`ArchiveUpdated/`) - **ACTIVE**

**Location:** `ArchiveUpdated/` directory  
**Build Tool:** Astro  
**Output:** `archive/archive.html` and related assets (copied from `dist/`)  
**Base Path:** `/archive/`  
**Status:** **ACTIVE** - This is the version currently used on the website

#### Build Commands

```bash
cd ArchiveUpdated
npm install          # Install dependencies
npm run dev         # Development server (localhost:4321)
npm run build       # Build for production (outputs to dist/)
```

#### Build Process

**Automated Build (Recommended):**
```bash
npm run build:archive
```

The `build-archive.ps1` script automates the entire process:

1. **Build**: Runs `npm run build` to generate static files in `dist/`
2. **Copy Output**: Automatically copies `dist/` contents to `archive/` directory:
   - `dist/index.html` → `archive/archive.html`
   - `dist/_astro/` → `archive/_astro/`
   - `dist/favicon/` → `archive/favicon/`
   - `dist/images/` → `archive/images/`
   - `dist/icons/` → `archive/icons/`
   - All subdirectories (artist pages, etc.)
   - Sitemap files and robots.txt
3. **Verification**: Optionally verifies paths and critical files

**Manual Build (Alternative):**
1. Run `npm run build` to generate static files in `dist/`
2. Manually copy `dist/` contents to `archive/` directory

#### Build Output Structure (in `archive/` directory)

```
archive/
├── archive.html          # Main output (generated from ArchiveUpdated/)
├── _astro/              # Compiled assets (JS, CSS, fonts)
├── favicon/             # Favicon files
├── images/              # Album and artist images
├── icons/               # Social media icons
├── [artist_id]/         # Artist pages (generated)
├── releases/            # Releases page
├── history/             # History page
├── store/               # Store page
├── contact/             # Contact page
└── sitemap-index.xml    # Sitemap
```

#### Integration with Main Website

- **Navigation:** Main site links to `/archive/archive.html`
- **Sitemap:** Listed in root `sitemap.xml`
- **Service Worker (optional):** Cached by main site's `sw.js`; the site runs online without it

**Note:** The `archive/` directory contains the **build output** from ArchiveUpdated/, not source code. Source code is in `ArchiveUpdated/`.

---

---

### 4. Spotify Visualiser (`spotify-visualiser/`)

**Location:** `spotify-visualiser/` directory  
**Build Tool:** Vite + TypeScript  
**Output:** `spotify-visualiser/dist/` (then copied to `spotify-visualiser/` for GitHub Pages)

#### Build Commands

```bash
cd spotify-visualiser
npm install          # Install dependencies
npm run dev         # Development server (localhost:5173)
npm run build       # Build for production
```

#### Build Process

1. **TypeScript Compilation:** TypeScript files compiled to JavaScript
2. **Vite Bundling:** Assets bundled and optimized
3. **Output:** Generated to `dist/` directory
4. **Deployment:** Copy `dist/` contents to `spotify-visualiser/` root for GitHub Pages

#### Integration with Main Website

- **Navigation:** Linked from main site navigation menu
- **Sitemap:** Listed in root `sitemap.xml`
- **API:** **None required** – visualiser uses only local images and audio files (no Spotify API calls)

---

### 4. ElasticGridScroll

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

# 2. ArchiveUpdated project (active archive)
cd ArchiveUpdated
npm run build:archive  # Automated build and copy
cd ..

# 3. Spotify Visualiser (if updated)
cd spotify-visualiser
npm run build
# Copy dist/ contents to spotify-visualiser/ root
cd ..

# 4. Commit and push all changes
git add .
git commit -m "Rebuild all projects"
git push origin master
```

### For Archive-Only Updates

```bash
cd ArchiveUpdated
npm run build:archive  # Automated build and copy to archive/
cd ..
git add archive/ ArchiveUpdated/
git commit -m "Update archive"
git push origin master
```

### For Spotify Visualiser Updates

```bash
cd spotify-visualiser
npm run build
# Manually copy dist/ contents to spotify-visualiser/ root
cd ..
git add spotify-visualiser/
git commit -m "Update Spotify Visualiser"
git push origin master
```

---

## Build Dependencies

### Node.js Version

- **Required:** Node.js 18+ for all projects
- **Recommended:** Node.js 20+ (LTS)

### Package Managers

- **npm** - Used by all projects
- **PowerShell** - Required for `archive/build-archive.ps1` (Windows)

### Build Tools

- **Astro** - Used by ArchiveUpdated/ (active)
- **Vite** - Used by spotify-visualiser/
- **TypeScript** - Used by spotify-visualiser/

---

## Deployment Integration

### GitHub Pages

All projects deploy to GitHub Pages automatically:

1. **Main Website:** Root directory → `https://karthikprasadm.github.io/`
2. **Archive:** `archive/archive.html` → `https://karthikprasadm.github.io/archive/archive.html`
3. **Spotify Visualiser:** `spotify-visualiser/` → `https://karthikprasadm.github.io/spotify-visualiser/`
4. **ElasticGridScroll:** `ElasticGridScroll/` → `https://karthikprasadm.github.io/ElasticGridScroll/`

### Vercel (API Endpoints)

- **API Endpoints:** Deploy to Vercel for serverless functions
- **Endpoints:** `/api/signature`
- **Environment Variables:** Set in Vercel dashboard

---

## Troubleshooting

### ArchiveUpdated Build Issues

**Problem:** Paths incorrect after build  
**Solution:** 
- Run `npm run verify` to check paths
- Verify that `base: '/archive/'` is set in `ArchiveUpdated/astro.config.mjs`

**Problem:** Build fails with Astro errors  
**Solution:** 
- Check Node.js version (18+)
- Run `npm install` in ArchiveUpdated/ directory
- Check `astro.config.mjs` base path configuration

**Problem:** Build output not copied to archive/ directory  
**Solution:** 
- Use `npm run build:archive` instead of `npm run build`
- This automatically copies dist/ to archive/ directory
- Or manually copy `dist/` contents to `archive/` directory

**Problem:** Stale files in archive/ directory  
**Solution:** 
- Use `npm run build:archive:clean` to clean archive/ before building
- Or use `.\build-archive.ps1 -Clean` flag

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

### Build Output Management

**Important:** 
- ArchiveUpdated/ is the **active** source project
- Build output goes to `ArchiveUpdated/dist/`
- **Automated:** Use `npm run build:archive` to automatically copy to `archive/` directory
- **Manual:** Or manually copy `dist/` contents to `archive/` directory for deployment
- `archive/` directory contains build output, not source code

**Cleanup:**
- Use `npm run build:archive:clean` to clean both `dist/` and `archive/` before building
- Or use `-Clean` flag with PowerShell script: `.\build-archive.ps1 -Clean`

---

## Best Practices

1. **Build Order:** Always build ArchiveUpdated/ before deploying (if updated)
2. **Use Automated Build:** Use `npm run build:archive` to automate build + copy process
3. **Clean Builds:** Use `npm run build:archive:clean` to ensure clean output
4. **Verification:** Use `npm run verify` or `npm run build:archive:verify` to check paths
5. **Testing:** Test locally before pushing to production
6. **Documentation:** Update this document if build processes change
7. **Version Control:** Commit build outputs (archive.html, etc.) to git
8. **Environment Variables:** Never commit `.env` files, set in deployment platform
9. **Source vs Output:** Remember that ArchiveUpdated/ is source, archive/ is output

---

## Future Improvements

1. **Automated Build Script:** Create root-level script to build all projects
2. **GitHub Actions:** Set up CI/CD to auto-build on push
3. **Build Verification:** Add automated tests for build outputs
4. **Build Script:** ✅ Created - `build-archive.ps1` automates ArchiveUpdated/dist/ to archive/ copy
5. **TypeScript Migration:** Consider migrating main project to TypeScript

---

**Last Updated:** Based on current project structure  
**Maintained By:** Project maintainer
