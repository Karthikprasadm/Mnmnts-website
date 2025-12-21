// Error Handler Utility
// Provides user-friendly error messages and error recovery

class ErrorHandler {
    constructor() {
        this.errorContainer = null;
        this.init();
    }

    init() {
        // Lazy initialization: only create container when needed
        // Check if document is ready to avoid issues if called before DOM
        if (typeof document === 'undefined' || !document.body) {
            // DOM not ready, will initialize on first use
            return;
        }
        
        // Create error notification container if it doesn't exist
        if (!document.getElementById('error-notification')) {
            this.errorContainer = document.createElement('div');
            this.errorContainer.id = 'error-notification';
            this.errorContainer.className = 'error-notification';
            this.errorContainer.setAttribute('role', 'alert');
            this.errorContainer.setAttribute('aria-live', 'polite');
            this.errorContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(244, 67, 54, 0.95);
                backdrop-filter: blur(10px);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                max-width: 400px;
                display: none;
                font-family: 'Montserrat', sans-serif;
                font-size: 0.9rem;
            `;
            document.body.appendChild(this.errorContainer);
        } else {
            this.errorContainer = document.getElementById('error-notification');
        }
    }

    showError(message, details = null, retryCallback = null) {
        if (!this.errorContainer) this.init();

        const errorHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="font-size: 1.2rem;">⚠️</span>
                <div style="flex: 1;">
                    <strong style="display: block; margin-bottom: 4px;">${message}</strong>
                    ${details ? `<small style="opacity: 0.9;">${details}</small>` : ''}
                    ${retryCallback ? `<button onclick="window.errorHandler.retry()" style="margin-top: 8px; padding: 6px 12px; background: white; color: #f44336; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Retry</button>` : ''}
                </div>
                <button onclick="this.parentElement.parentElement.style.display='none'" style="background: transparent; border: none; color: white; font-size: 1.2rem; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
            </div>
        `;

        this.errorContainer.innerHTML = errorHTML;
        this.errorContainer.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (this.errorContainer) {
                this.errorContainer.style.display = 'none';
            }
        }, 5000);

        // Store retry callback
        if (retryCallback) {
            this.retryCallback = retryCallback;
        }
    }

    retry() {
        if (this.retryCallback) {
            this.retryCallback();
            this.errorContainer.style.display = 'none';
        }
    }

    hide() {
        if (this.errorContainer) {
            this.errorContainer.style.display = 'none';
        }
    }

    // Handle API errors
    handleAPIError(error, endpoint, fallbackCallback = null) {
        console.error(`API Error (${endpoint}):`, error);
        
        const message = 'Failed to load data';
        const details = `Unable to connect to ${endpoint}. ${fallbackCallback ? 'Using cached data.' : 'Please check your connection.'}`;
        
        this.showError(message, details, fallbackCallback);
        
        // Call fallback if provided
        if (fallbackCallback) {
            try {
                fallbackCallback();
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                this.showError('Failed to load data', 'Both API and fallback failed. Please refresh the page.');
            }
        }
    }

    // Handle network errors
    handleNetworkError(error, retryCallback = null) {
        console.error('Network Error:', error);
        this.showError(
            'Connection Error',
            'Unable to connect to the server. Please check your internet connection.',
            retryCallback
        );
    }

    // Handle image loading errors
    handleImageError(imageElement, fallbackSrc = null) {
        if (fallbackSrc) {
            imageElement.src = fallbackSrc;
        } else {
            imageElement.style.display = 'none';
            console.warn('Image failed to load:', imageElement.src || imageElement.getAttribute('data-src'));
        }
    }
}

// Create global instance
const errorHandler = new ErrorHandler();
window.errorHandler = errorHandler;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}

