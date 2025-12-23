# Service Worker & Performance Optimization Guide

## Overview

Enhanced service worker with comprehensive offline support, background sync, and preloading for critical resources. This is optional; the site works online without enabling the service worker/PWA.

## Features

### 1. Offline Support (optional)
- **Cached Resources**: All critical pages, styles, scripts, and fonts
- **Offline Page**: Custom offline fallback page
- **Cache Strategies**:
  - **Pages**: Network first, cache fallback
  - **Images**: Cache first, network update
  - **API**: Network first, cache fallback
- **Automatic Cache Updates**: Background updates when online

### 2. Background Sync (optional)
- **Form Submissions**: Queue form data when offline, sync when online
- **API Requests**: Retry failed API calls automatically
- **IndexedDB Storage**: Persistent queue storage
- **Automatic Retry**: Syncs when connection is restored

### 3. Preloading
- **Critical CSS**: Preload main stylesheets
- **Critical Fonts**: Preload web fonts (WOFF2)
- **Critical Scripts**: Preload essential JavaScript
- **Critical Data**: Preload JSON data files
- **DNS Preconnect**: Preconnect to external domains

## Cache Strategy

### Cache Types

1. **Main Cache** (`museum-of-moments-v1.0.2`)
   - HTML pages
   - CSS files
   - JavaScript files
   - JSON data files
   - Fonts

2. **Image Cache** (`museum-images-v1.0.2`)
   - Gallery images
   - Thumbnails
   - Video thumbnails

3. **API Cache** (`museum-api-v1.0.2`)
   - API responses
   - Gallery data
   - Project data

## Usage

### Service Worker Registration

The service worker is automatically registered on page load. You can also use the utility:

```javascript
// Check if service worker is active
if (serviceWorkerUtils && serviceWorkerUtils.registration) {
  console.log('Service Worker active');
}
```

### Background Sync

#### Queue Form Submission

```javascript
// When form submission fails (offline)
serviceWorkerUtils.addToSyncQueue({
  type: 'form',
  url: '/api/submit',
  method: 'POST',
  data: formData,
  headers: { 'Content-Type': 'application/json' }
}).then(id => {
  console.log('Queued for sync:', id);
});
```

#### Get Sync Queue

```javascript
serviceWorkerUtils.getSyncQueue().then(queue => {
  console.log('Pending items:', queue);
});
```

### Preload Resources

```javascript
// Preload additional resources
serviceWorkerUtils.preloadResources([
  '/assets/images/new-image.jpg',
  '/assets/scripts/new-script.js'
]);
```

### Cache URLs on Demand

```javascript
// Cache additional URLs
serviceWorkerUtils.cacheUrls([
  '/new-page.html',
  '/assets/new-style.css'
]);
```

## Offline Behavior

### When Online
1. Fetch from network
2. Cache successful responses
3. Update existing cache entries

### When Offline
1. Try cache first
2. Return cached version if available
3. Show offline page for navigation requests
4. Queue API requests for background sync

## Background Sync Flow

1. **User Action** (offline)
   - Form submission or API request fails
   - Item added to sync queue in IndexedDB

2. **Connection Restored**
   - Background sync event triggered
   - Service worker processes queue
   - Retries failed requests

3. **Success**
   - Item removed from queue
   - Client notified via message
   - UI updated

## Preloaded Resources

### Gallery Page
- Critical CSS files
- Web fonts (Montserrat, Playfair Display)
- API client script
- Main gallery script
- Gallery data JSON

### Other Pages
Add preloading to other pages as needed:

```html
<link rel="preload" href="path/to/resource" as="style|script|font|image">
```

## Cache Management

### Automatic Cleanup
- Old caches deleted on service worker update
- Cache versioning prevents conflicts

### Manual Cache Clear
Users can clear cache via browser settings, or you can add a button:

```javascript
// Clear all caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

## Testing

### Test Offline Mode

1. Open DevTools → Application → Service Workers
2. Check "Offline" checkbox
3. Reload page
4. Verify offline page appears
5. Check cached resources load

### Test Background Sync

1. Go offline
2. Submit a form or make API request
3. Check IndexedDB for queued items
4. Go online
5. Verify sync happens automatically

### Test Preloading

1. Open DevTools → Network
2. Reload page
3. Check "Priority" column
4. Verify critical resources marked as "High"

## Performance Benefits

- **Faster Load Times**: Preloaded resources ready immediately
- **Offline Access**: Full functionality when offline
- **Reduced Data Usage**: Cached resources don't re-download
- **Better UX**: Seamless offline/online transitions
- **Background Sync**: No lost data when offline

## Browser Support

- ✅ Chrome/Edge (full support)
- ✅ Firefox (full support)
- ✅ Safari (iOS 11.3+, macOS 11.1+)
- ⚠️ Background Sync: Chrome/Edge only
- ⚠️ IndexedDB: All modern browsers

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Verify `sw.js` is accessible
- Check HTTPS requirement (required for service workers)

### Cache Not Updating
- Increment `CACHE_VERSION` in `sw.js`
- Clear browser cache
- Unregister old service worker

### Background Sync Not Working
- Verify browser support (Chrome/Edge)
- Check IndexedDB is available
- Verify sync queue items are valid

### Preload Not Working
- Check resource URLs are correct
- Verify CORS headers for external resources
- Check browser DevTools Network tab

## Next Steps

1. **Add More Preloading**: Identify other critical resources
2. **Optimize Cache Strategy**: Adjust based on usage patterns
3. **Add Analytics**: Track cache hit rates
4. **Implement Push Notifications**: Use for content updates
5. **Add Cache Size Limits**: Prevent excessive storage usage

