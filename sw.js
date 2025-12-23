// Enhanced Service Worker with Offline Support and Background Sync
const CACHE_VERSION = 'v1.0.2';
const CACHE_NAME = `museum-of-moments-${CACHE_VERSION}`;
const IMAGE_CACHE = `museum-images-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/offline.html';

// Critical resources to cache immediately
const urlsToCache = [
  '/',
  '/index.html',
  '/gallery/index.html',
  '/know-me/about.html',
  '/archive/archive.html',
  '/image-upload/upload.html',
  '/offline.html',
  '/assets/styles/galaxy.css',
  '/assets/styles/icons.css',
  '/assets/scripts/script.js',
  '/assets/scripts/tooltips.js',
  '/archive/archive.js',
  '/know-me/about.js',
  '/manifest.json',
  '/favicon.ico',
  '/assets/images/gallery-data.json',
  '/assets/videos/videos-data.json',
  '/assets/fonts/fonts.css',
  '/assets/fonts/montserrat-400-latin.woff2',
  '/assets/fonts/montserrat-600-latin.woff2',
  '/assets/fonts/playfair-400-latin.woff2',
  '/assets/fonts/playfair-600-latin.woff2'
];

// External resources that can be cached
const externalResources = [
  'https://www.transparenttextures.com/patterns/stardust.png'
];

// Background sync queue storage
const SYNC_QUEUE_KEY = 'background-sync-queue';

function isCacheableRequest(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  
  // Skip uploads and sensitive endpoints
  if (url.pathname.startsWith('/uploads/') || url.pathname.includes('signature')) {
    return false;
  }
  
  return true;
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname) ||
         request.destination === 'image';
}


function broadcastMessage(data) {
  self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
    clients.forEach(client => client.postMessage(data));
  });
}

// Install event - Cache critical resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Cache main resources
      caches.open(CACHE_NAME).then(cache => {
        console.log('Service Worker: Caching critical files');
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })))
          .catch(err => {
            console.warn('Service Worker: Some files failed to cache', err);
            // Continue even if some files fail
            return Promise.resolve();
          });
      }),
      // Cache external resources
      caches.open(CACHE_NAME).then(cache => {
        return Promise.allSettled(
          externalResources.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
            }).catch(err => {
              console.warn(`Failed to cache external resource: ${url}`, err);
            })
          )
        );
      })
    ]).then(() => {
      console.log('Service Worker: Installed successfully');
      // Let clients know offline cache is ready
      broadcastMessage({ type: 'OFFLINE_READY', version: CACHE_VERSION });
      return self.skipWaiting();
    }).catch(err => {
      console.error('Service Worker: Installation failed', err);
    })
  );
});

// Activate event - Clean up old caches
// Ensures cache version consistency across all cache types (main, images, API)
// All caches use the same CACHE_VERSION, so any cache without the current version is deleted
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches that don't match current version
          // This handles all cache types: main cache and image cache
          if (!cacheName.includes(CACHE_VERSION)) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated successfully');
      // Take control of all clients immediately
      return self.clients.claim().then(() => {
        broadcastMessage({ type: 'SW_ACTIVATED', version: CACHE_VERSION });
      });
    })
  );
});

// Fetch event - Network first with cache fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip WebSocket connections
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }
  
  // Handle different types of requests
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isCacheableRequest(request)) {
    event.respondWith(handlePageRequest(request));
  }
});

// Handle image requests - Cache first, network fallback
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    // Return cached version and update in background
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => {
      // Network failed, but we have cache
    });
    return cached;
  }
  
  // Try network
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Network failed, return placeholder or error
    return new Response('', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}


// Handle page requests - Network first with offline fallback
async function handlePageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Ignore non-HTTP(S) schemes (e.g. chrome-extension://) which Cache API can't handle
    const url = new URL(request.url);
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:';

    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses for HTTP(S) only
      if (isHttp && request.method === 'GET') {
        try {
          await cache.put(request, response.clone());
        } catch (cacheError) {
          // Silently ignore cache write failures so they don't break page load
          console.warn('Service Worker: cache.put failed for', request.url, cacheError);
        }
      }
      return response;
    }
    
    // If network response is not ok, try cache
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    return response;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', request.url);
    
    // Network failed, try cache
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // If it's a navigation request, return offline page
    if (request.destination === 'document' || request.mode === 'navigate') {
      const offlinePage = await cache.match(OFFLINE_PAGE);
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    // Return generic offline response
    return new Response('Offline content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// Background Sync - Enhanced implementation
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncFormSubmissions());
  } else if (event.tag === 'sync-all') {
    event.waitUntil(syncAll());
  }
});

// Sync form submissions - SECURED: Only allow to specific authorized endpoints
async function syncFormSubmissions() {
  try {
    const queue = await getSyncQueue();
    const formsToSync = queue.filter(item => item.type === 'form');
    
    if (formsToSync.length === 0) {
      console.log('Service Worker: No forms to sync');
      return;
    }
    
    // SECURITY: Only allow sync to authorized endpoints
    const AUTHORIZED_ENDPOINTS = [
      '/api/signature', // ImageKit signature endpoint (read-only from client perspective)
      // Add other authorized endpoints here if needed
    ];
    
    console.log(`Service Worker: Syncing ${formsToSync.length} form submissions`);
    
    for (const item of formsToSync) {
      try {
        // SECURITY CHECK: Verify endpoint is authorized
        const url = new URL(item.url, self.location.origin);
        const isAuthorized = AUTHORIZED_ENDPOINTS.some(endpoint => 
          url.pathname === endpoint || url.pathname.startsWith(endpoint + '/')
        );
        
        if (!isAuthorized) {
          console.warn('Service Worker: Unauthorized sync endpoint blocked', item.url);
          // Remove unauthorized items from queue
          await removeFromSyncQueue(item.id);
          continue;
        }
        
        const response = await fetch(item.url, {
          method: item.method || 'POST',
          headers: item.headers || { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        
        if (response.ok) {
          // Remove from queue on success
          await removeFromSyncQueue(item.id);
          console.log('Service Worker: Form synced successfully', item.id);
          
          // Notify client
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              id: item.id,
              data: item
            });
          });
        } else {
          console.error('Service Worker: Form sync failed', item.id, response.status);
          
          // Notify client of sync failure
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_ERROR',
              id: item.id,
              url: item.url,
              error: `Form sync failed: ${response.status} ${response.statusText}`
            });
          });
        }
      } catch (error) {
        console.error('Service Worker: Form sync error', item.id, error);
        
        // Notify client of sync error
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_ERROR',
            id: item.id,
            url: item.url,
            error: error.message || 'Form sync error'
          });
        });
      }
    }
  } catch (error) {
    console.error('Service Worker: Sync form submissions error', error);
  }
}


// Sync all pending items
async function syncAll() {
  await syncFormSubmissions();
}

// Get sync queue from IndexedDB
async function getSyncQueue() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('portfolio-sync-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('syncQueue')) {
        resolve([]);
        return;
      }
      
      const transaction = db.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const getAll = store.getAll();
      
      getAll.onsuccess = () => resolve(getAll.result || []);
      getAll.onerror = () => reject(getAll.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id' });
      }
    };
  });
}

// Add to sync queue
async function addToSyncQueue(item) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('portfolio-sync-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      
      const itemWithId = {
        ...item,
        id: item.id || Date.now() + Math.random(),
        timestamp: new Date().toISOString()
      };
      
      const addRequest = store.add(itemWithId);
      addRequest.onsuccess = () => resolve(itemWithId.id);
      addRequest.onerror = () => reject(addRequest.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id' });
      }
    };
  });
}

// Remove from sync queue
async function removeFromSyncQueue(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('portfolio-sync-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const deleteRequest = store.delete(id);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Push notifications
self.addEventListener('push', event => {
  console.log('Service Worker: Push message received');
  
  const data = event.data ? event.data.json() : { 
    title: 'Museum of Moments',
    body: 'New content available!'
  };
  
  const options = {
    body: data.body || 'New content available!',
    icon: '/favicon/android-icon-192x192.png',
    badge: '/favicon/android-icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/favicon/android-icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Museum of Moments', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification click received', event.action);
  
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    const url = event.notification.data.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        // Check if window is already open
        for (let client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', event => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_URLS') {
    // Cache additional URLs on demand
    const urls = event.data.urls;
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urls);
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  } else if (event.data && event.data.type === 'ADD_TO_SYNC_QUEUE') {
    // Add item to sync queue
    addToSyncQueue(event.data.item).then(id => {
      event.ports[0].postMessage({ success: true, id: id });
    }).catch(error => {
      event.ports[0].postMessage({ success: false, error: error.message });
    });
  } else if (event.data && event.data.type === 'GET_SYNC_QUEUE') {
    // Get sync queue
    getSyncQueue().then(queue => {
      event.ports[0].postMessage({ success: true, queue: queue });
    }).catch(error => {
      event.ports[0].postMessage({ success: false, error: error.message });
    });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-cache') {
    event.waitUntil(updateCache());
  }
});

async function updateCache() {
  console.log('Service Worker: Periodic cache update');
  // Update cached resources in background
  const cache = await caches.open(CACHE_NAME);
  // Add your cache update logic here
}
