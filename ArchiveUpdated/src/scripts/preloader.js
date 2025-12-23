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
  return new Promise((resolve, reject) => {
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
      console.warn('Some images failed to load:', instance.images.filter(img => !img.isLoaded).map(img => img.img?.src || 'background image'));
      // Still resolve to allow page to load even if some images fail
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

// Execute a callback only if the current page is an archive "home" page.
const handlePageEvent = (event, callback) => {
  const page = document.documentElement.getAttribute('data-page');
  // Treat both "home" (original template) and "archive" (base-path build) as the archive homepage
  if (page === 'home' || page === 'archive') {
    callback();
  }
};

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
