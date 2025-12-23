# Spotify Visualizer - Website Integration Guide

This guide explains how the Spotify Visualizer is integrated into the main website and how to maintain it.

## 🎯 Integration Status

✅ **Integrated Visualiser** – The audio visualiser (formerly "Spotify Visualiser") is part of your main website navigation.  
It no longer connects to the Spotify API and instead plays locally hosted audio files.

## 📍 Location

- **Path**: `/spotify-visualiser/`
- **URL**: `https://karthikprasadm.github.io/spotify-visualiser/`
- **Build Output**: `spotify-visualiser/dist/` (after running `npm run build`)

## 🔗 Navigation Integration

The Spotify Visualizer has been added to the navigation menu on all pages:

### Pages Updated:
1. ✅ `gallery/index.html` - Added "Spotify Visualizer" link
2. ✅ `know-me/about.html` - Added "Spotify Visualizer" link
3. ✅ `image-upload/upload.html` - Added "Spotify Visualizer" link
4. ✅ `spotify-visualiser/index.html` - Added self-reference in menu

### Menu Structure:
```
Menu Dropdown:
├── Open gallery
├── Know me
├── View archive
├── Open upload
└── Spotify Visualizer ← NEW
```

## 🗺️ Sitemap

The Spotify Visualizer has been added to `sitemap.xml`:
- URL: `https://karthikprasadm.github.io/spotify-visualiser/index.html`
- Priority: 0.8
- Change Frequency: Weekly

## 🛠️ Build & Deployment

### Development
```bash
cd spotify-visualiser
npm run dev
```
Runs on `http://localhost:5173/spotify-visualiser/`

### Production Build
```bash
cd spotify-visualiser
npm run build
```
Outputs to `spotify-visualiser/dist/`

### GitHub Pages Deployment

The Vite config is set with `base: "/spotify-visualiser/"` for GitHub Pages.

**Deployment Steps:**
1. Build the project: `npm run build`
2. Copy `dist/` contents to the root `spotify-visualiser/` directory
3. Commit and push to GitHub
4. GitHub Pages will serve it automatically

**Alternative (Automated):**
You can set up a GitHub Actions workflow to automatically build and deploy:

```yaml
# .github/workflows/deploy-spotify-visualiser.yml
name: Deploy Spotify Visualizer
on:
  push:
    paths:
      - 'spotify-visualiser/**'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: |
          cd spotify-visualiser
          npm install
          npm run build
      - run: |
          cp -r spotify-visualiser/dist/* spotify-visualiser/
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./spotify-visualiser
```

## 📁 File Structure

```
Karthikprasadm.github.io/
├── spotify-visualiser/
│   ├── index.html          # Main entry point
│   ├── src/                # Source files
│   ├── public/             # Static assets
│   ├── dist/               # Build output (gitignored)
│   ├── package.json
│   └── vite.config.js      # Configured with base path
├── gallery/
├── know-me/
├── archive/
└── image-upload/
```

## 🔧 Configuration

### Vite Configuration
The `vite.config.js` includes:
- **Base Path**: `/spotify-visualiser/` for GitHub Pages
- **Code Splitting**: Optimized chunks
- **PWA Support (optional)**: Service worker enabled; visualiser runs fine online without SW
- **Build Optimization**: Minification, tree-shaking

### Navbar Integration
The visualizer uses the same navbar component as other pages:
- Consistent styling (glassmorphism)
- Same social icons
- Unified navigation menu

## 🚀 Features

The integrated Spotify Visualizer includes:
- ✅ Interactive 3D WebGL visualization
- ✅ Music player with full controls
- ✅ Lyrics display
- ✅ Search functionality
- ✅ Queue management
- ✅ Volume control
- ✅ Keyboard shortcuts
- ✅ Responsive design
- ✅ PWA support (offline capable)
- ✅ Performance optimizations

## 🔄 Updating the Visualizer

### To Update Navigation Links:
1. Edit `spotify-visualiser/index.html` navbar section
2. Update relative paths if page structure changes

### To Add New Features:
1. Develop in `spotify-visualiser/src/`
2. Test with `npm run dev`
3. Build with `npm run build`
4. Deploy to GitHub Pages

## 📝 Notes

- **Relative Paths**: All navigation uses relative paths (`../../`) for flexibility
- **Base Path**: Vite is configured with `base: "/spotify-visualiser/"` for asset paths
- **Consistent Styling**: Uses the same CSS classes as other pages (`navbar`, `stars`, etc.)
- **SEO**: Included in sitemap for search engine indexing

## 🐛 Troubleshooting

### Assets Not Loading
- Check that `base` path in `vite.config.js` matches deployment path
- Verify asset paths in built HTML files

### Navigation Not Working
- Ensure relative paths are correct (`../../` for two levels up)
- Check that target pages exist

### Build Errors
- Run `npm install` to ensure dependencies are installed
- Check Node.js version (requires Node 20+)

## 📚 Related Documentation

- `PERFORMANCE_OPTIMIZATIONS.md` - Performance features
- `package.json` - Dependencies and scripts
- Main website `PROJECT_STRUCTURE_ANALYSIS.md` - Overall site structure
