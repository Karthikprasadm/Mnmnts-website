const CACHE_NAME = 'museum-of-moments-v1.0.1';
const urlsToCache = [
  '/',
  '/index.html', // redirects to /gallery/index.html
  '/gallery/index.html',
  '/know-me/about.html',
  '/archive/archive.html',
  '/image-upload/upload.html',
  '/project-detail/project-detail.html',
  '/assets/styles/galaxy.css',
  '/assets/styles/styles.css',
  '/assets/scripts/script.js',
  '/archive/archive.js',
  '/know-me/about.js',
  '/manifest.json',
  '/favicon.ico',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Playfair+Display:wght@400;600&display=swap',
  'https://www.transparenttextures.com/patterns/stardust.png'
];

function isCacheableRequest(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  // Only same-origin resources (except allowed external font/texture above)
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin) {
    // allowlisted externals already pre-cached; skip runtime cache for others
    return false;
  }
  // Skip API/signature/uploads to avoid caching sensitive responses
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) return false;
  if (url.pathname.includes('signature')) return false;
  return true;
}

// Install event
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installed successfully');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('Service Worker: Cache failed', err);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated successfully');
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  if (!isCacheableRequest(event.request)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return response;
        }

        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the fetched response
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(err => {
          console.error('Service Worker: Fetch failed', err);
          
          // Return offline page for navigation requests
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          
          // Return a fallback response for other requests
          return new Response('Offline content not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any pending form submissions or data sync
  console.log('Service Worker: Performing background sync');
  // Implementation depends on your specific needs
}

// Push notifications (if needed in future)
self.addEventListener('push', event => {
  console.log('Service Worker: Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'New content available!',
    icon: '/favicon/android-icon-192x192.png',
    badge: '/favicon/android-icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/favicon/android-icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon/android-icon-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Museum of Moments', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', event => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 