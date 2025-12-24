import imagesLoaded from 'imagesloaded';

// Preloader element reference
let loading;

// Initialize the preloader element.
const initializeElements = () => {
  loading = document.querySelector('.loading');
};

// Load all images and background images on the page.
// Resolves when all assets are loaded, or rejects if any fail.
const loadImages = () => {
  return new Promise((resolve, _reject) => {
    // Collect all <img> elements.
    const imgElements = document.querySelectorAll('img');

    // Collect elements with background images.
    const bgElements = [...document.querySelectorAll('*')].filter((el) => {
      const style = window.getComputedStyle(el);
      return style.backgroundImage !== 'none';
    });

    // Combine both sets of elements.
    const allElements = [...imgElements, ...bgElements];

    // Use imagesLoaded to track asset loading.
    const imgLoad = imagesLoaded(allElements, { background: true });
    imgLoad.on('done', resolve);
    imgLoad.on('fail', (instance) => {
      // Log failed images but don't block the page
      console.warn('Some images failed to load:', instance.images.filter(img => !img.isLoaded).map(img => img.img?.src || img.element));
      // Resolve anyway to allow page to continue
      resolve();
    });
  });
};

// Load assets and dispatch a custom event when done.
const loadAssets = async () => {
  try {
    await loadImages();
    const event = new CustomEvent('assetsLoaded');
    document.dispatchEvent(event);
  } catch (error) {
    console.error('Failed to load assets:', error);
    throw error;
  }
};

// Show the preloader, load assets if needed, and then hide the preloader.
const toggleLoading = async () => {
  if (sessionStorage.getItem('preloadComplete') === 'true') {
    hide();
    return;
  }
  show();
  try {
    await loadAssets();
    sessionStorage.setItem('preloadComplete', 'true');
    hide();
  } catch (error) {
    console.error('Failed to load assets or animate:', error);
    // Hide preloader even if there's an error to prevent blank page
    hide();
    sessionStorage.setItem('preloadComplete', 'true');
  }
};

// Display the preloader.
const show = () => {
  loading.classList.remove('hidden');
};

// Hide the preloader.
const hide = () => {
  loading.classList.add('hidden');
};

// Cleanup to reset references.
const cleanup = () => {
  loading = null;
};

// Initialize the preloader logic.
const init = () => {
  initializeElements();
  toggleLoading();
};

// Execute a callback only if the current page is the home page.
const handlePageEvent = (_event, callback) => {
  const page = document.documentElement.getAttribute('data-page');
  if (page === 'home') callback();
};

// Initialize immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
  });
} else {
  // DOM is already ready, initialize immediately
  init();
}

// Listen for Astro's lifecycle events.
document.addEventListener('astro:page-load', () => {
  handlePageEvent('page-load', init);
});

document.addEventListener('astro:before-swap', () => {
  handlePageEvent('before-swap', cleanup);
});

// Clear the preload flag before page unload to ensure the loader appears on refresh.
window.addEventListener('beforeunload', () => {
  sessionStorage.removeItem('preloadComplete');
});

// Fallback: ensure preloader is hidden after 10 seconds regardless
setTimeout(() => {
  const loading = document.querySelector('.loading');
  if (loading && !loading.classList.contains('hidden')) {
    loading.classList.add('hidden');
  }
}, 10000);
