# Deployment Guide

## Quick Fix: Deploy Built Files

The Spotify Visualizer needs to be **built** before it can be accessed from your website. The source files won't work directly.

### Step 1: Build the Project

```bash
cd spotify-visualiser
npm run build
```

This creates a `dist/` folder with all the production-ready files.

### Step 2: Deploy to GitHub Pages

**Option A: Copy dist files to spotify-visualiser directory**

```powershell
# PowerShell
cd spotify-visualiser
Copy-Item -Path "dist\*" -Destination "." -Recurse -Force
```

**Option B: Use GitHub Actions (Recommended)**

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
          
      - name: Deploy
        run: |
          cd spotify-visualiser
          cp -r dist/* .
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .
          git commit -m "Deploy Spotify Visualizer" || exit 0
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
3. Copy `dist/*` to `spotify-visualiser/`
4. Commit and push

