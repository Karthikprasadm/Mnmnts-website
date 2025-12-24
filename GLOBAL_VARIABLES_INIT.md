# Global Variables Initialization Order

This document describes the initialization order and dependencies of global variables used throughout the portfolio website.

## Initialization Order

The following global variables are created in this order:

1. **`Logger`** (`assets/scripts/logger.js`)
   - **Created**: Immediately on script load (IIFE)
   - **Dependencies**: None
   - **Used by**: All other scripts for standardized logging
   - **Availability**: `window.Logger`

2. **`errorHandler`** (`assets/scripts/error-handler.js`)
   - **Created**: Immediately on script load
   - **Dependencies**: None (but uses Logger if available)
   - **Used by**: `global-error-handler.js`, `script.js`, `about.js`
   - **Availability**: `window.errorHandler`

3. **`serviceWorkerUtils`** (`assets/scripts/sw-utils.js`)
   - **Created**: Immediately on script load (constructor calls async `init()`)
   - **Dependencies**: None (but uses Logger if available)
   - **Used by**: Background sync for ImageKit signature endpoint
   - **Availability**: `window.serviceWorkerUtils`
   - **Note**: Initialization is async, but instance is available immediately

## Script Loading Order in HTML

To ensure proper initialization, scripts should be loaded in this order:

```html
<!-- 1. Logger (load first for standardized logging) -->
<script src="../assets/scripts/logger.js"></script>

<!-- 2. Error Handler (load early for error handling) -->
<script src="../assets/scripts/error-handler.js"></script>

<!-- 3. Global Error Handler (depends on errorHandler) -->
<script src="../assets/scripts/global-error-handler.js"></script>

<!-- 3. Service Worker Utils (optional; only if offline/PWA enabled) -->
<script src="../assets/scripts/sw-utils.js"></script>

<!-- 4. Page-specific scripts -->
<script src="../assets/scripts/script.js"></script>
```

## Dependency Graph

```
Logger
  ├── errorHandler (optional)
  ├── global-error-handler (optional)
  └── sw-utils (optional)

errorHandler
  └── global-error-handler (required)

serviceWorkerUtils
  └── (used for background sync with ImageKit signature endpoint)
```

## Safe Usage Patterns

### Checking for Availability

Always check if a global variable exists before using it:

```javascript
// Good: Check before use
if (typeof errorHandler !== 'undefined' && errorHandler.showError) {
  errorHandler.showError('Error message');
}

// Good: Check Logger availability
if (typeof Logger !== 'undefined' && Logger.info) {
  Logger.info('Message');
} else {
  console.log('Message'); // Fallback
}

// Bad: Direct use without check
errorHandler.showError('Error message'); // May fail if not loaded
```

### Initialization Timing

- **Synchronous**: `Logger`, `errorHandler`, `serviceWorkerUtils` (instance)
- **Asynchronous**: `serviceWorkerUtils.init()`

### Best Practices

1. **Always check availability** before using global variables
2. **Use Logger** for consistent logging (with console fallback)
3. **Load scripts in order** as specified above
4. **Handle async initialization** for service worker
5. **Use fallbacks** when dependencies may not be available

## Notes

- All global variables are created as singleton instances
- Scripts are designed to work independently if dependencies are missing
- Logger is optional but recommended for consistent logging
- Service Worker initialization is async but instance is available immediately

