// Logger Utility
// Standardized logging for production and development
// Use this instead of console.log/error/warn directly

(function() {
    'use strict';

    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('vercel.app');

    const Logger = {
        // Log info messages (only in development)
        info: function(...args) {
            if (isDevelopment) {
                console.log('[INFO]', ...args);
            }
        },

        // Log warnings (always shown, but formatted)
        warn: function(...args) {
            console.warn('[WARN]', ...args);
        },

        // Log errors (always shown, but formatted)
        error: function(...args) {
            console.error('[ERROR]', ...args);
        },

        // Log debug messages (only in development)
        debug: function(...args) {
            if (isDevelopment) {
                console.log('[DEBUG]', ...args);
            }
        },

        // Log success messages (only in development)
        success: function(...args) {
            if (isDevelopment) {
                console.log('[SUCCESS]', ...args);
            }
        }
    };

    // Make available globally
    window.Logger = Logger;

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Logger;
    }
})();

