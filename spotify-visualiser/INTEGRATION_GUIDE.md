# Spotify Visualizer - Website Integration Guide

This guide explains how the Spotify Visualizer is integrated into the main website and how to maintain it.

## 🎯 Integration Status

✅ **Integrated Visualiser** – The audio visualiser is part of your main website navigation.  
It supports **Spotify Mode** (Web API + Web Playback SDK) and **Local Mode** (local audio files).

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
├── Gallery
├── About
├── Upload
├── Visualizer
└── Repository
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
2. Commit the build output: `git add spotify-visualiser/dist`
3. Commit and push to `modern-ui`
4. GitHub Pages and `server.js` serve from `spotify-visualiser/dist`

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
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./spotify-visualiser/dist
```

## 📁 File Structure

```
Mnmnts-website/
├── spotify-visualiser/
│   ├── index.html          # Main entry point
│   ├── src/                # Source files
│   ├── public/             # Static assets
│   ├── dist/               # Build output (committed for Pages/server.js)
│   ├── package.json
│   └── vite.config.js      # Configured with base path
├── gallery/
├── know-me/
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
The visualizer uses the Menu-new navbar component (same as all other pages):
- Consistent styling (glassmorphism, CSS Grid overlay system)
- Same social icons (Instagram, LinkedIn, Pinterest, Spotify, GitHub)
- Unified navigation menu with hover expansion
- Links: Gallery, About, Upload, Repository
- Fixed positioning: `position: fixed`, `top: 0.5rem`, `z-index: 5000` (above 3D canvas)
- Size: Fixed 300px (no expansion on hover)
- Behavior: Hover menu button to expand, Escape key to collapse

## 🚀 Features

The integrated Spotify Visualizer includes:
- ✅ Interactive 3D WebGL visualization
- ✅ Music player with full controls
- ✅ Spotify OAuth login + token refresh
- ✅ Spotify Mode + Local Mode toggle
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
- **Spotify API**: Requires `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `VITE_SPOTIFY_CLIENT_ID`
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
