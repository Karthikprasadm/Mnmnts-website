/**
 * Smooth Page Transitions
 * Handles smooth transitions between pages with fade and scale effects
 */

(function() {
    'use strict';

    // Check if transitions are supported
    const supportsTransitions = 'transition' in document.documentElement.style;
    if (!supportsTransitions) return;

    // Transition configuration
    const TRANSITION_DURATION = 400; // ms
    const TRANSITION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

    // Add transition class to body
    document.body.classList.add('page-transition-ready');

    /**
     * Handle page exit (fade out)
     */
    function handlePageExit(event) {
        // Only handle internal links
        const link = event.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Skip external links, anchors, and special links
        if (
            href.startsWith('#') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            href.startsWith('javascript:') ||
            link.target === '_blank' ||
            link.hasAttribute('data-no-transition')
        ) {
            return;
        }

        // Check if it's an internal link
        const isInternal = href.startsWith('/') || 
                          href.startsWith('./') || 
                          href.startsWith('../') ||
                          !href.includes('://');

        if (!isInternal) return;

        // Prevent default navigation
        event.preventDefault();

        // Add exit class
        document.body.classList.add('page-exit');

        // Navigate after transition
        setTimeout(() => {
            window.location.href = href;
        }, TRANSITION_DURATION);
    }

    /**
     * Handle page enter (fade in)
     */
    function handlePageEnter() {
        // Remove exit class if present
        document.body.classList.remove('page-exit');
        
        // Add enter class
        document.body.classList.add('page-enter');

        // Remove enter class after animation
        setTimeout(() => {
            document.body.classList.remove('page-enter');
        }, TRANSITION_DURATION);
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        // Handle page enter
        handlePageEnter();

        // Handle all link clicks
        document.addEventListener('click', handlePageExit, true);

        // Handle browser back/forward
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                // Page was loaded from cache
                handlePageEnter();
            }
        });
    });

    // Handle popstate (back/forward navigation)
    window.addEventListener('popstate', () => {
        handlePageEnter();
    });
})();

