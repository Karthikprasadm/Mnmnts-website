/**
 * Mobile Hamburger Menu
 * Handles mobile menu toggle and animations
 */

(function() {
    'use strict';

    // Menu configuration
    const MENU_BREAKPOINT = 768; // px
    const ANIMATION_DURATION = 300; // ms

    /**
     * Initialize mobile menu
     */
    function initMobileMenu() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        // Check if mobile menu already exists
        if (navbar.querySelector('.mobile-menu-toggle')) return;

        // Create hamburger button
        const hamburger = document.createElement('button');
        hamburger.className = 'mobile-menu-toggle';
        hamburger.setAttribute('aria-label', 'Toggle mobile menu');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML = `
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        `;

        // Find dropdown menu
        const dropdown = navbar.querySelector('.dropdown');
        if (!dropdown) return;

        // Clone dropdown content for mobile menu
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        if (!dropdownContent) return;

        // Create mobile menu overlay
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu-overlay';
        mobileMenu.setAttribute('aria-hidden', 'true');

        // Clone menu items
        const menuItems = dropdownContent.cloneNode(true);
        menuItems.className = 'mobile-menu-content';
        mobileMenu.appendChild(menuItems);

        // Insert hamburger before dropdown
        dropdown.parentNode.insertBefore(hamburger, dropdown);

        // Append mobile menu to body
        document.body.appendChild(mobileMenu);

        // Toggle menu function
        function toggleMenu() {
            const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
            const newState = !isOpen;

            hamburger.setAttribute('aria-expanded', String(newState));
            mobileMenu.setAttribute('aria-hidden', String(!newState));
            document.body.classList.toggle('mobile-menu-open', newState);
            hamburger.classList.toggle('active', newState);
        }

        // Event listeners
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu when clicking overlay
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                toggleMenu();
            }
        });

        // Close menu when clicking a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Small delay to allow transition
                setTimeout(() => {
                    toggleMenu();
                }, 100);
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
                toggleMenu();
            }
        });

        // Close menu on window resize (if switching to desktop)
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > MENU_BREAKPOINT) {
                    if (hamburger.getAttribute('aria-expanded') === 'true') {
                        toggleMenu();
                    }
                }
            }, 150);
        });

        // Handle initial state
        updateMenuVisibility();
        window.addEventListener('resize', updateMenuVisibility);
    }

    /**
     * Update menu visibility based on screen size
     * DISABLED - Mobile development deferred, focusing on desktop/PC
     */
    function updateMenuVisibility() {
        // Mobile menu disabled for now - focusing on desktop development
        const hamburger = document.querySelector('.mobile-menu-toggle');
        const dropdown = document.querySelector('.dropdown');

        if (hamburger && dropdown) {
            // Always hide hamburger, always show dropdown (desktop focus)
            hamburger.style.display = 'none';
            dropdown.style.display = 'block';
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }
})();

