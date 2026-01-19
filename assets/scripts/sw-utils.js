// Service Worker Utilities
// Helper functions for interacting with the service worker

class ServiceWorkerUtils {
  constructor() {
    this.registration = null;
    this.messageHandler = null; // Store handler reference for cleanup
    this.enabled = typeof window !== 'undefined' && window.enableServiceWorker === true;
    if (this.enabled) {
      this.init();
    } else {
      // Optional: flip window.enableServiceWorker = true before this file loads to enable SW
      if (typeof Logger !== 'undefined') {
        Logger.info('Service Worker disabled (window.enableServiceWorker is not true)');
      }
    }
  }

  async init() {
    if (!this.enabled) return;
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
          if (!event.data || !event.data.type) return;

          if (event.data.type === 'SYNC_SUCCESS') {
            this.showSyncNotification(event.data.message || 'Data synced successfully', 'success');
          } else if (event.data.type === 'SYNC_ERROR') {
            this.showSyncNotification(event.data.message || 'Sync failed', 'error');
          } else if (event.data.type === 'OFFLINE_READY') {
            this.showNotice({
              icon: '☑',
              title: 'Offline ready',
              message: 'Cache is ready. You can use the site offline.',
              primary: { label: 'Got it', action: 'dismiss' },
              tone: 'info'
            });
          } else if (event.data.type === 'SW_ACTIVATED') {
            this.showNotice({
              icon: '⟳',
              title: 'Update ready',
              message: 'New version available. Reload to use it.',
              primary: { label: 'Update', action: 'update' },
              secondary: { label: 'Later', action: 'dismiss' },
              tone: 'update'
            });
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

  showNotice(opts = {}) {
    const {
      icon = '⟳',
      title = 'Update ready',
      message = 'New version available!',
      primary = { label: 'Update', action: 'update' },
      secondary,
      tone = 'update'
    } = opts;

    const existing = document.querySelector('.sw-update-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'sw-update-notification';
    
    // Safe DOM creation instead of innerHTML
    const content = document.createElement('div');
    content.className = 'sw-update-content';
    
    const left = document.createElement('div');
    left.className = 'sw-update-left';
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'sw-update-icon';
    iconDiv.textContent = icon;
    
    const textDiv = document.createElement('div');
    textDiv.className = 'sw-update-text';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'sw-update-title';
    titleDiv.textContent = title;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'sw-update-message';
    messageDiv.textContent = message;
    
    textDiv.appendChild(titleDiv);
    textDiv.appendChild(messageDiv);
    left.appendChild(iconDiv);
    left.appendChild(textDiv);
    content.appendChild(left);
    
    const actions = document.createElement('div');
    actions.className = 'sw-update-actions';
    
    const primaryBtn = document.createElement('button');
    primaryBtn.className = 'sw-update-btn primary';
    primaryBtn.setAttribute('data-action', primary.action || 'dismiss');
    primaryBtn.textContent = primary.label || 'OK';
    
    actions.appendChild(primaryBtn);
    
    if (secondary) {
        const secondaryBtn = document.createElement('button');
        secondaryBtn.className = 'sw-update-btn secondary';
        secondaryBtn.setAttribute('data-action', secondary.action || 'dismiss');
        secondaryBtn.textContent = secondary.label;
        actions.appendChild(secondaryBtn);
    }
    
    content.appendChild(actions);
    notification.appendChild(content);
        <div class="sw-update-actions">
          <button class="sw-update-btn primary" data-action="${primary.action || 'dismiss'}">${primary.label || 'OK'}</button>
          ${secondary ? `<button class="sw-update-btn secondary" data-action="${secondary.action || 'dismiss'}">${secondary.label}</button>` : ''}
        </div>
      </div>
    `;

    // Inline styles (self-contained)
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 0.9rem 1.1rem;
      background: linear-gradient(135deg, rgba(32,32,40,0.95), rgba(18,18,26,0.95));
      color: #e9edf5;
      border: 1px solid ${tone === 'update' ? 'rgba(255, 193, 82, 0.28)' : 'rgba(120, 200, 255, 0.28)'};
      border-radius: 16px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.35);
      z-index: 10050;
      max-width: 420px;
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      animation: swFadeIn 0.25s ease-out;
    `;

    const content = notification.querySelector('.sw-update-content');
    content.style.cssText = `
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 0.8rem;
      align-items: center;
    `;

    const left = notification.querySelector('.sw-update-left');
    left.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.8rem;
      min-width: 0;
    `;

    const icon = notification.querySelector('.sw-update-icon');
    icon.style.cssText = `
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      background: ${tone === 'update' ? 'rgba(255, 193, 82, 0.18)' : 'rgba(120, 200, 255, 0.18)'};
      color: ${tone === 'update' ? '#ffc152' : '#9fd6ff'};
      font-weight: 800;
      font-size: 1.1rem;
      box-shadow: inset 0 0 0 1px rgba(255,193,82,0.28);
    `;

    const text = notification.querySelector('.sw-update-text');
    text.style.cssText = `
      display: grid;
      gap: 0.15rem;
      min-width: 0;
    `;

    const title = notification.querySelector('.sw-update-title');
    title.style.cssText = `
      font-size: 0.98rem;
      font-weight: 700;
      color: #f7f9ff;
      letter-spacing: 0.01em;
    `;

    const msg = notification.querySelector('.sw-update-message');
    msg.style.cssText = `
      font-size: 0.9rem;
      line-height: 1.4;
      color: #cdd6e6;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 260px;
    `;

    const actions = notification.querySelector('.sw-update-actions');
    actions.style.cssText = `
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      flex-wrap: nowrap;
    `;

    notification.querySelectorAll('.sw-update-btn').forEach((btn) => {
      btn.style.cssText = `
        padding: 0.55rem 1rem;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.08);
        color: #f5f5f5;
        cursor: pointer;
        font-weight: 700;
        font-size: 0.9rem;
        transition: background 0.18s ease, transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        min-width: 86px;
      `;
      if (btn.classList.contains('primary')) {
        if (tone === 'update') {
          btn.style.background = 'linear-gradient(135deg, #f6c344, #e89b2b)';
          btn.style.color = '#1c1c24';
          btn.style.borderColor = 'rgba(255,193,82,0.7)';
        } else {
          btn.style.background = 'linear-gradient(135deg, #6fb7ff, #3e8adf)';
          btn.style.color = '#0f1522';
          btn.style.borderColor = 'rgba(120,200,255,0.7)';
        }
      } else {
        btn.style.background = 'rgba(255,255,255,0.06)';
      }
      btn.addEventListener('mouseover', () => {
        btn.style.transform = 'translateY(-1px)';
        btn.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)';
        if (!btn.classList.contains('primary')) {
          btn.style.background = 'rgba(255,255,255,0.12)';
        }
      });
      btn.addEventListener('mouseout', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = 'none';
        if (!btn.classList.contains('primary')) {
          btn.style.background = 'rgba(255,255,255,0.06)';
        }
      });
    });

    notification.querySelectorAll('.sw-update-btn').forEach((btn) => {
      btn.onclick = () => {
        const action = btn.dataset.action;
        notification.remove();
        if (action === 'update') {
          this.updateServiceWorker();
        }
      };
    });

    document.body.appendChild(notification);
  }

  // Update service worker
  async updateServiceWorker() {
    // If we have a waiting worker, tell it to activate immediately
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      // Give it a tick to activate, then reload to take control
      setTimeout(() => window.location.reload(), 150);
      return;
    }
    // Fallback: if no waiting worker is present (e.g., offline-ready notice),
    // just reload to ensure latest assets are in use.
    window.location.reload();
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

