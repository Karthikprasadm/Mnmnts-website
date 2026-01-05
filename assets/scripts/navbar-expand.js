/**
 * Navbar Expand Menu
 * Makes the navbar expand inline with menu items when menu button is hovered
 * Desktop/PC focus - mobile development deferred
 */

(function() {
    'use strict';

    /**
     * Initialize navbar expansion
     */
    function initNavbarExpand() {
        const navbar = document.querySelector('.navbar');
        const dropdown = navbar?.querySelector('.dropdown');
        const dropbtn = dropdown?.querySelector('.dropbtn');
        const dropdownContent = dropdown?.querySelector('.dropdown-content');

        if (!navbar || !dropdown || !dropbtn || !dropdownContent) return;

        // Mark as hover-based
        dropdown.classList.add('hover-based');

        // On main page, initialize navbar to expanded width
        if (!document.body.classList.contains('about-page') && !document.body.classList.contains('upload-page')) {
            // Temporarily expand to measure width
            navbar.classList.add('navbar-expanded');
            dropbtn.setAttribute('aria-expanded', 'true');
            
            // Measure expanded width
            requestAnimationFrame(() => {
                const expandedWidth = navbar.offsetWidth;
                if (expandedWidth > 0) {
                    navbar.style.setProperty('width', expandedWidth + 'px', 'important');
                    navbar.style.setProperty('min-width', expandedWidth + 'px', 'important');
                    navbar.dataset.widthSet = 'true';
                }
                
                // Collapse but keep the width
                navbar.classList.remove('navbar-expanded');
                dropbtn.setAttribute('aria-expanded', 'false');
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
            
            // Allow width to expand - remove width constraints
            navbar.style.removeProperty('width');
            navbar.style.removeProperty('min-width');
            navbar.style.removeProperty('max-width');
            
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

        // Hover handlers for menu button
        dropbtn.addEventListener('mouseenter', () => {
            expandNavbar();
        });

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

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbarExpand);
    } else {
        initNavbarExpand();
    }
})();
