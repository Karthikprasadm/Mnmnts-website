// Service Worker Utilities
// Helper functions for interacting with the service worker

class ServiceWorkerUtils {
  constructor() {
    this.registration = null;
    this.messageHandler = null; // Store handler reference for cleanup
    this.init();
  }

  async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        // Use Logger if available, fallback to console
        if (typeof Logger !== 'undefined') {
          Logger.info('Service Worker registered:', this.registration);
        } else {
          console.log('Service Worker registered:', this.registration);
        }
        
        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              this.showUpdateNotification();
            }
          });
        });
        
        // Listen for background sync messages (scoped to this instance)
        this.messageHandler = (event) => {
          if (event.data && event.data.type === 'SYNC_SUCCESS') {
            this.showSyncNotification(event.data.message || 'Data synced successfully', 'success');
          } else if (event.data && event.data.type === 'SYNC_ERROR') {
            this.showSyncNotification(event.data.message || 'Sync failed', 'error');
          }
        };
        navigator.serviceWorker.addEventListener('message', this.messageHandler);
      } catch (error) {
        // Use Logger if available, fallback to console
        if (typeof Logger !== 'undefined') {
          Logger.error('Service Worker registration failed:', error);
        } else {
          console.error('Service Worker registration failed:', error);
        }
      }
    }
  }

  // Show update notification
  // Show background sync completion notification
  showSyncNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `sync-notification sync-notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 24px;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? 'rgba(76, 175, 80, 0.95)' : 'rgba(244, 67, 54, 0.95)'};
      backdrop-filter: blur(18px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: white;
      font-size: 0.9rem;
      font-family: 'Montserrat', sans-serif;
      z-index: 10001;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      animation: slideInRight 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'sw-update-notification';
    notification.innerHTML = `
      <div class="sw-update-content">
        <span>New version available!</span>
        <button onclick="serviceWorkerUtils.updateServiceWorker()">Update</button>
        <button onclick="this.parentElement.parentElement.remove()">Later</button>
      </div>
    `;
    document.body.appendChild(notification);
  }

  // Update service worker
  async updateServiceWorker() {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  // Add URLs to cache
  async cacheUrls(urls) {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        reject(new Error('Service Worker not active'));
        return;
      }

      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve(event.data);
        } else {
          reject(new Error(event.data.error));
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'CACHE_URLS', urls: urls },
        [messageChannel.port2]
      );
    });
  }

  // Add item to background sync queue
  async addToSyncQueue(item) {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        reject(new Error('Service Worker not active'));
        return;
      }

      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve(event.data.id);
          
          // Register background sync for forms
          if (this.registration && 'sync' in this.registration) {
            // Register sync for forms if this is a form submission
            if (item.type === 'form') {
              this.registration.sync.register('sync-forms');
            }
          }
        } else {
          reject(new Error(event.data.error));
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'ADD_TO_SYNC_QUEUE', item: item },
        [messageChannel.port2]
      );
    });
  }

  // Get sync queue
  async getSyncQueue() {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        reject(new Error('Service Worker not active'));
        return;
      }

      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve(event.data.queue);
        } else {
          reject(new Error(event.data.error));
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_SYNC_QUEUE' },
        [messageChannel.port2]
      );
    });
  }

  // Check if online
  isOnline() {
    return navigator.onLine;
  }

  // Listen for online/offline events
  onOnline(callback) {
    window.addEventListener('online', callback);
  }

  onOffline(callback) {
    window.addEventListener('offline', callback);
  }

  // Cleanup method to remove event listeners
  cleanup() {
    if (this.messageHandler && navigator.serviceWorker) {
      navigator.serviceWorker.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
  }

  // Preload critical resources
  preloadResources(urls) {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      
      // Determine as attribute based on file type
      if (/\.(css)$/i.test(url)) {
        link.as = 'style';
      } else if (/\.(js)$/i.test(url)) {
        link.as = 'script';
      } else if (/\.(woff2?|ttf|otf)$/i.test(url)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
        link.as = 'image';
      }
      
      document.head.appendChild(link);
    });
  }
}

// Create global instance
const serviceWorkerUtils = new ServiceWorkerUtils();

// Make available globally
window.serviceWorkerUtils = serviceWorkerUtils;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ServiceWorkerUtils;
}

