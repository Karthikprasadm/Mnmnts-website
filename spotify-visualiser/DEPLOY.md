# Deployment Guide

## Deploy Built Files (served from `dist/`)

The Spotify Visualizer must be **built** and the `dist/` output committed. The local `server.js` and GitHub Pages serve from `spotify-visualiser/dist`, so do not copy build output over the source files.

### Step 1: Build the Project

```bash
cd spotify-visualiser
npm run build
```

This creates a `dist/` folder with all the production-ready files.

### Step 2: Deploy to GitHub Pages

Commit the build output so it’s available at `/spotify-visualiser/`:

```bash
cd ..
git add spotify-visualiser/dist
git commit -m "chore: update visualiser build"
git push origin modern-ui
```

**Optional: GitHub Actions (Recommended)**

Create `.github/workflows/deploy-spotify-visualiser.yml`:

```yaml
name: Deploy Spotify Visualizer

on:
  push:
    paths:
      - 'spotify-visualiser/**'
      - '.github/workflows/deploy-spotify-visualiser.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: |
          cd spotify-visualiser
          npm ci
          
      - name: Build
        run: |
          cd spotify-visualiser
          npm run build
          
      - name: Deploy build output
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add spotify-visualiser/dist
          git commit -m "Deploy Spotify Visualizer build" || exit 0
          git push
```

### Step 3: Verify

After deployment, visit:
- `https://karthikprasadm.github.io/spotify-visualiser/`

The page should now show:
- ✅ Dark starry background
- ✅ Styled navigation menu
- ✅ 3D WebGL canvas
- ✅ Music player overlay

## Why This Happens

The source `index.html` references `/src/main.ts` which only works with:
1. Vite dev server (`npm run dev`)
2. Built production files

When accessing from your website menu, you're serving the raw HTML file, which doesn't have the compiled JavaScript and CSS. The build process:
- Compiles TypeScript → JavaScript
- Bundles all CSS
- Optimizes assets
- Updates paths to work from `/spotify-visualiser/` subdirectory

The built assets live in `spotify-visualiser/dist` and are served directly from there.

## Troubleshooting

### Still seeing white page?
1. Check browser console (F12) for 404 errors
2. Verify paths start with `/spotify-visualiser/`
3. Clear browser cache (Ctrl+Shift+R)

### Assets not loading?
- Make sure `base: "/spotify-visualiser/"` in `vite.config.js`
- Rebuild after any config changes

### Need to update?
1. Make changes to source files
2. Run `npm run build`
3. Commit `spotify-visualiser/dist`
4. Push to `modern-ui`

