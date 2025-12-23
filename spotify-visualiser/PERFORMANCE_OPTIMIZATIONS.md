# Performance & Optimization Guide

This document outlines all performance optimizations implemented in the Spotify Visualiser project.

## 🚀 Implemented Optimizations

### 1. Code Splitting

**Purpose**: Reduce initial bundle size and improve Time to Interactive (TTI)

**Implementation**:
- **Lazy Loading Components**:
  - `MusicPlayer` component is lazy-loaded using React's `lazy()` and `Suspense`
  - `Canvas` and `Planes` are dynamically imported to defer heavy Three.js initialization
  - Components load only when needed, reducing initial JavaScript payload

- **Manual Chunk Splitting** (configured in `vite.config.js`):
  - `react-vendor`: React and ReactDOM
  - `three-vendor`: Three.js library
  - `ui-vendor`: Framer Motion and Lucide React icons
  - `utils-vendor`: Utility libraries
  - `music-player`: Music player component bundle
  - `visualizer`: Canvas and planes rendering code

**Benefits**:
- Faster initial page load
- Better browser caching (vendor chunks change less frequently)
- Parallel chunk loading

### 2. Image Optimization

**Purpose**: Reduce image payload and improve loading performance

**Implementation**:
- **WebP Support Detection**: Utility function checks browser WebP support
- **Lazy Loading**: Images use `loading="lazy"` and `decoding="async"` attributes
- **Image Optimization Utilities** (`src/utils/imageOptimization.ts`):
  - `supportsWebP()`: Detects WebP format support
  - `getOptimizedImageUrl()`: Returns WebP version when available
  - `preloadImage()`: Preloads critical images
  - `lazyLoadImage()`: Intersection Observer-based lazy loading
  - `convertToWebP()`: Client-side WebP conversion (fallback)

**Current Status**:
- Album covers use lazy loading
- Playlist thumbnails load on demand
- Placeholder fallbacks for failed image loads

**Future Enhancement**: Convert images to WebP at build time using Vite plugins

### 3. Service Worker & PWA Support (optional)

**Purpose**: Enable offline functionality and improve caching (optional; app runs online without SW)

**Implementation**:
- **Vite PWA Plugin**: Configured with `vite-plugin-pwa@^1.0.1`
- **Workbox Configuration**:
  - **Static Assets**: Caches JS, CSS, HTML, images, fonts
  - **API Caching**: Spotify API responses cached with NetworkFirst strategy (24h TTL)
  - **Image Caching**: Images cached with CacheFirst strategy (30 days TTL)
- **PWA Manifest**: Configured for installable app experience

**Features**:
- Automatic service worker registration
- Offline support for cached resources
- Background sync capabilities
- App-like experience when installed

**Cache Strategy**:
- **NetworkFirst**: For API calls (always try network, fallback to cache)
- **CacheFirst**: For static assets (images, fonts, etc.)

### 4. Bundle Size Optimization

**Purpose**: Minimize JavaScript bundle size

**Implementation**:
- **Tree Shaking**: Enabled by default in Vite (ES modules)
- **Minification**: Terser with aggressive settings
  - Removes `console.log` in production
  - Removes `debugger` statements
  - Dead code elimination
- **Source Maps**: Disabled in production (`sourcemap: false`)
- **Chunk Size Limits**: Warning threshold set to 1000KB

**Optimizations**:
- Dynamic imports for heavy dependencies
- Named exports instead of default exports where beneficial
- Removed unused dependencies

### 5. React Performance Optimizations

**Purpose**: Reduce unnecessary re-renders and improve component performance

**Implementation**:
- **Memoization**:
  - `useMemo` for expensive calculations (`currentTrack`, `filteredPlaylist`)
  - `useCallback` for event handlers
  - `memo` for component memoization (where applicable)
- **Lazy Loading**: MusicPlayer component loaded on demand
- **Image Loading**: Lazy loading with error handling

### 6. WebGL/Canvas Optimizations

**Purpose**: Improve rendering performance

**Implementation** (from previous optimizations):
- **Renderer Settings**:
  - `powerPreference: "high-performance"` for GPU preference
  - `antialias: false` for better performance
- **Event Throttling**:
  - Mouse move events throttled to ~60fps
  - Resize events debounced with `requestAnimationFrame`
- **Conditional Rendering**: Only renders when planes are ready
- **Passive Event Listeners**: Used for scroll and resize events

### 7. CSS Performance

**Purpose**: Reduce paint and composite costs

**Implementation** (from previous optimizations):
- **GPU Acceleration**:
  - `will-change` properties on animated elements
  - `transform: translateZ(0)` for hardware acceleration
- **Reduced Blur**: Backdrop filter blur reduced from 18px to 12px
- **Optimized Animations**: Using `transform` and `opacity` for animations

## 📊 Performance Metrics

### Before Optimizations:
- Initial bundle: ~2-3MB (estimated)
- Time to Interactive: ~3-5s (estimated)
- No code splitting
- No service worker

### After Optimizations:
- Initial bundle: Reduced by ~40-60% (estimated)
- Code splitting: 6+ separate chunks
- Service worker: Enabled with caching
- Lazy loading: Components load on demand

## 🔧 Build Configuration

### Vite Configuration (`vite.config.js`)

```javascript
{
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Intelligent chunk splitting
        }
      }
    },
    minify: "terser",
    sourcemap: false
  }
}
```

### PWA Configuration

- Service worker auto-registration
- Workbox runtime caching
- PWA manifest for installability

## 📝 Usage

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

The build will:
1. Split code into optimized chunks
2. Minify and tree-shake code
3. Generate service worker
4. Optimize assets

### Preview Production Build
```bash
npm run preview
```

## 🎯 Future Enhancements

1. **Image Optimization at Build Time**:
   - Use `vite-imagetools` or similar to convert images to WebP
   - Generate responsive image sizes
   - Implement srcset for different screen sizes

2. **Bundle Analysis**:
   - Add `rollup-plugin-visualizer` to analyze bundle composition
   - Identify further optimization opportunities

3. **Resource Hints**:
   - Add `<link rel="preload">` for critical resources
   - Implement `<link rel="prefetch">` for likely next pages

4. **HTTP/2 Server Push**:
   - Configure server to push critical resources

5. **CDN Integration**:
   - Serve static assets from CDN
   - Implement edge caching

## 🔍 Monitoring

To monitor performance:
1. Use Chrome DevTools Lighthouse
2. Check Network tab for chunk loading
3. Monitor Service Worker in Application tab
4. Use Performance tab for rendering metrics

## 📚 References

- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [Web.dev Performance](https://web.dev/performance/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
