# Archive Build Documentation

## Overview

The archive is an Astro-based static site that showcases music artists and albums. It's built and deployed as part of the main website repository at `archive/archive.html`.

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm
- PowerShell (for build scripts on Windows)

### Installation

```bash
cd archive
npm install
```

## Build Process

### Automated Build (Recommended)

Use the automated build script that handles everything:

```bash
# Standard build
npm run build:archive

# Clean build (removes dist/ first)
npm run build:archive:clean

# Build with verification
npm run build:archive:verify
```

Or directly with PowerShell:

```powershell
.\build-archive.ps1
.\build-archive.ps1 -Clean
.\build-archive.ps1 -Verify
```

### Manual Build

If you need to build manually:

```bash
# 1. Build Astro project
npm run build

# 2. Copy files (see build-archive.ps1 for details)
# 3. Update paths (see build-archive.ps1 for details)
```

## Build Script Details

The `build-archive.ps1` script performs these steps:

1. **Clean** (optional): Removes `dist/` directory
2. **Build**: Runs `npm run build` to generate static files
3. **Copy Main File**: Copies `dist/index.html` → `archive/archive.html`
4. **Copy Assets**: Copies `_astro/`, `favicon/`, `images/`, `icons/`, and subdirectories
5. **Update Paths**: Updates all HTML files to use `/archive/` prefix
6. **Update Sitemaps**: Updates XML sitemap files with correct URLs
7. **Update robots.txt**: Sets correct sitemap URL

## Path Configuration

The archive uses Astro's `base` configuration (`/archive/`) to ensure all paths are correctly prefixed. Source templates use `import.meta.env.BASE_URL` for dynamic path resolution.

### Source Files Using Base URL

- `src/layouts/BaseLayout.astro` - Favicon, OG images, sitemap links
- `src/components/Navbar.astro` - Navigation links
- `src/components/Header.astro` - Header navigation
- `src/components/ArtistCard.astro` - Artist links
- `src/components/AlbumCard.astro` - Album links
- `src/pages/[artist_id].astro` - Artist page links

## Verification

Run path verification to check for issues:

```bash
npm run verify
```

Or directly:

```powershell
.\verify-paths.ps1
```

This checks:
- All HTML files for correct `/archive/` prefixes
- Sitemap XML files for correct URLs
- robots.txt configuration
- Critical files exist

## Project Structure

```
archive/
├── src/              # Astro source files
│   ├── components/   # React-like components
│   ├── layouts/      # Page layouts
│   ├── pages/        # Route pages
│   ├── data/         # Content collections (artists, albums)
│   └── styles/       # Global styles
├── public/           # Static assets (copied to dist/)
├── dist/             # Build output (temporary, gitignored)
├── archive.html      # Main output file
├── _astro/          # Compiled assets (JS, CSS, fonts)
├── favicon/         # Favicon files
├── images/          # Album and artist images
├── icons/           # Social media icons
├── [artist_id]/     # Artist pages
├── releases/        # Releases page
├── history/         # History page
├── store/          # Store page
├── contact/        # Contact page
├── build-archive.ps1  # Build script
├── verify-paths.ps1   # Verification script
└── astro.config.mjs   # Astro configuration
```

## Configuration

### Astro Config (`astro.config.mjs`)

Key settings:
- `base: '/archive/'` - Base path for all URLs
- `site: 'https://karthikprasadm.github.io/'` - Site URL
- `output: 'static'` - Static site generation

### Environment Variables

Astro automatically provides:
- `import.meta.env.BASE_URL` - The base path (`/archive/`)
- `import.meta.env.SITE` - The site URL

## Troubleshooting

### Build Fails

1. Check Node.js version: `node --version` (should be 18+)
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check for TypeScript errors: `npm run build` (shows errors)

### Paths Not Updated

1. Run verification: `npm run verify`
2. Check if source templates use `import.meta.env.BASE_URL`
3. Rebuild: `npm run build:archive:clean`

### Assets Missing

1. Verify assets exist in `public/` directory
2. Check build output in `dist/`
3. Ensure build script copied assets correctly

### Links Broken

1. Run verification script
2. Check browser console for 404 errors
3. Verify all HTML files were updated
4. Check sitemap XML files

## Development

### Local Development

```bash
npm run dev
```

Starts dev server at `http://localhost:4321/archive/`

### Preview Build

```bash
npm run build
npm run preview
```

## Deployment

The archive is deployed as part of the main website:

1. Build: `npm run build:archive`
2. Commit changes: `git add archive/`
3. Push to repository
4. GitHub Pages automatically deploys

## Maintenance

### Updating Content

1. Edit markdown files in `src/data/artists/` or `src/data/albums/`
2. Rebuild: `npm run build:archive`
3. Commit and push

### Adding New Artists/Albums

1. Create markdown file in appropriate `src/data/` directory
2. Add image to `public/images/`
3. Rebuild: `npm run build:archive`

### Updating Styles

1. Edit files in `src/styles/` or component styles
2. Rebuild: `npm run build:archive`

## Best Practices

1. **Always use automated build script** - Don't manually copy files
2. **Run verification after builds** - Catch path issues early
3. **Test locally** - Use `npm run preview` before deploying
4. **Check browser console** - Look for 404 errors
5. **Update source templates** - Don't rely on post-build path fixes

## Related Files

- `ARCHIVE_BUILD_SUMMARY.md` - Implementation summary
- `ARCHIVE_BUILD_ANALYSIS.md` - Analysis of build process
- `README.md` - Original Astro template documentation

