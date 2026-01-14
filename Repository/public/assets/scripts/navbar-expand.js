/**
 * Navbar Expand Menu
 * Makes the navbar expand inline with menu items when menu button is hovered
 * Desktop/PC focus - mobile development deferred
 */

(function() {
    'use strict';

    let initialized = false;
    let retryCount = 0;
    const MAX_RETRIES = 20;
    let eventListenersAttached = false;

    /**
     * Initialize navbar expansion
     */
    function initNavbarExpand() {
        const navbar = document.querySelector('.navbar');
        const dropdown = navbar?.querySelector('.dropdown');
        const dropbtn = dropdown?.querySelector('.dropbtn');
        const dropdownContent = dropdown?.querySelector('.dropdown-content');

        if (!navbar || !dropdown || !dropbtn || !dropdownContent) {
            // Retry after a short delay for Astro/client-side rendering
            if (retryCount < MAX_RETRIES) {
                retryCount++;
                setTimeout(initNavbarExpand, 100);
            }
            return;
        }

        // Only attach event listeners once
        if (eventListenersAttached) {
            return;
        }

        // Mark as having attached listeners
        eventListenersAttached = true;

        // Mark as hover-based
        dropdown.classList.add('hover-based');

        // On main pages, lock navbar width to expanded width immediately
        if (!document.body.classList.contains('about-page') && !document.body.classList.contains('upload-page')) {
            requestAnimationFrame(() => {
                // Temporarily expand to measure full width
            navbar.classList.add('navbar-expanded');
            dropbtn.setAttribute('aria-expanded', 'true');
            
            requestAnimationFrame(() => {
                const expandedWidth = navbar.offsetWidth;
                if (expandedWidth > 0) {
                    navbar.style.setProperty('width', expandedWidth + 'px', 'important');
                    navbar.style.setProperty('min-width', expandedWidth + 'px', 'important');
                        navbar.style.setProperty('max-width', expandedWidth + 'px', 'important');
                    navbar.dataset.widthSet = 'true';
                }
                    // Collapse but keep width locked
                navbar.classList.remove('navbar-expanded');
                dropbtn.setAttribute('aria-expanded', 'false');
                });
            });
        }

        // Expand function
        function expandNavbar() {
            // Lock only height - allow width to expand horizontally
            const currentHeight = navbar.offsetHeight;
            
            // Lock height only - allow width to grow horizontally
            navbar.style.setProperty('height', currentHeight + 'px', 'important');
            navbar.style.setProperty('min-height', currentHeight + 'px', 'important');
            navbar.style.setProperty('max-height', currentHeight + 'px', 'important');
            
            // Reset animation by removing and re-adding class
            navbar.classList.remove('navbar-expanded');
            // Force reflow to reset animation
            void navbar.offsetWidth;
            
            navbar.classList.add('navbar-expanded');
            dropbtn.setAttribute('aria-expanded', 'true');
            
            // Store expanded width and set as default for main page
            requestAnimationFrame(() => {
                navbar.style.setProperty('height', currentHeight + 'px', 'important');
                navbar.style.setProperty('min-height', currentHeight + 'px', 'important');
                navbar.style.setProperty('max-height', currentHeight + 'px', 'important');
                
                // On main page (not about/upload), measure expanded width and set as default
                if (!document.body.classList.contains('about-page') && !document.body.classList.contains('upload-page')) {
                    // Wait a bit for layout to settle
                    setTimeout(() => {
                        const expandedWidth = navbar.offsetWidth;
                        if (expandedWidth > 0 && !navbar.dataset.widthSet) {
                            navbar.style.setProperty('width', expandedWidth + 'px', 'important');
                            navbar.style.setProperty('min-width', expandedWidth + 'px', 'important');
                        navbar.style.setProperty('max-width', expandedWidth + 'px', 'important');
                            navbar.dataset.widthSet = 'true';
                        }
                    }, 100);
                }
            });
            
            // Double-check height after a short delay
            setTimeout(() => {
                if (navbar.classList.contains('navbar-expanded')) {
                    navbar.style.setProperty('height', currentHeight + 'px', 'important');
                    navbar.style.setProperty('min-height', currentHeight + 'px', 'important');
                    navbar.style.setProperty('max-height', currentHeight + 'px', 'important');
                }
            }, 50);
        }

        // Collapse function
        function collapseNavbar() {
            navbar.classList.remove('navbar-expanded');
            dropbtn.setAttribute('aria-expanded', 'false');
            
            // Remove locked dimensions to allow natural sizing
            navbar.style.removeProperty('height');
            navbar.style.removeProperty('min-height');
            navbar.style.removeProperty('max-height');
        }

        // Hover handlers for menu button and dropdown
        dropbtn.addEventListener('mouseenter', expandNavbar);
        dropdown.addEventListener('mouseenter', expandNavbar);

        // Keep expanded when hovering over navbar
        navbar.addEventListener('mouseenter', () => {
            if (dropbtn.matches(':hover') || dropdown.matches(':hover') || dropdownContent.matches(':hover')) {
                expandNavbar();
            }
        });

        // Collapse when mouse leaves navbar
        navbar.addEventListener('mouseleave', () => {
            collapseNavbar();
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navbar.classList.contains('navbar-expanded')) {
                collapseNavbar();
            }
        });
    }

    // Initialize function that resets state
    function initialize() {
        retryCount = 0;
        eventListenersAttached = false;
        initNavbarExpand();
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Also try on window load (for Astro/client-side rendering)
    window.addEventListener('load', () => {
        if (!eventListenersAttached) {
            initialize();
        }
    });

    // Reinitialize on Astro navigation (if using client-side routing)
    if (typeof window !== 'undefined') {
        document.addEventListener('astro:page-load', () => {
            eventListenersAttached = false;
            retryCount = 0;
            setTimeout(initialize, 100);
        });
        
        // Also listen for after-swap event
        document.addEventListener('astro:after-swap', () => {
            eventListenersAttached = false;
            retryCount = 0;
            setTimeout(initialize, 100);
        });
    }
})();
