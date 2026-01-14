// Global Error Handler
// Catches unhandled errors and promise rejections for better error tracking

(function() {
    'use strict';

    // Track if error handler is already initialized
    let initialized = false;

    function initGlobalErrorHandler() {
        if (initialized) return;
        initialized = true;

        // Handle synchronous errors
        window.onerror = function(message, source, lineno, colno, error) {
            // Log error details (use Logger if available, fallback to console)
            const errorDetails = {
                message: message,
                source: source,
                line: lineno,
                column: colno,
                error: error
            };
            if (typeof Logger !== 'undefined' && Logger.error) {
                Logger.error('Global Error Handler:', errorDetails);
            } else {
                console.error('Global Error Handler:', errorDetails);
            }

            // Use error handler if available
            if (typeof errorHandler !== 'undefined' && errorHandler.showError) {
                const errorMessage = error?.message || message || 'An unexpected error occurred';
                errorHandler.showError(
                    'Unexpected Error',
                    errorMessage,
                    () => {
                        // Retry callback - reload page
                        window.location.reload();
                    }
                );
            }

            // Return false to allow default error handling
            return false;
        };

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', function(event) {
            // Log rejection (use Logger if available, fallback to console)
            if (typeof Logger !== 'undefined' && Logger.error) {
                Logger.error('Unhandled Promise Rejection:', event.reason);
            } else {
                console.error('Unhandled Promise Rejection:', event.reason);
            }

            // Use error handler if available (with explicit check)
            if (typeof errorHandler !== 'undefined' && errorHandler && errorHandler.showError) {
                const errorMessage = event.reason?.message || 
                                   (typeof event.reason === 'string' ? event.reason : 'Promise rejection') ||
                                   'An unexpected error occurred';
                errorHandler.showError(
                    'Promise Rejection',
                    errorMessage,
                    () => {
                        // Retry callback - reload page
                        window.location.reload();
                    }
                );
            }

            // Prevent default browser console error (optional)
            // event.preventDefault();
        });

        // Log initialization (use Logger if available, fallback to console)
        if (typeof Logger !== 'undefined' && Logger.info) {
            Logger.info('Global error handler initialized');
        } else {
            console.log('Global error handler initialized');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGlobalErrorHandler);
    } else {
        initGlobalErrorHandler();
    }
})();

