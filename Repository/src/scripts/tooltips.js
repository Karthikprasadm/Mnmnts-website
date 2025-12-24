// Custom tooltip initialization
(function() {
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            const tooltipText = element.getAttribute('data-tooltip');
            if (tooltipText && !element.querySelector('.custom-tooltip')) {
                const tooltip = document.createElement('span');
                tooltip.className = 'custom-tooltip';
                tooltip.textContent = tooltipText;
                element.appendChild(tooltip);
                // Remove title attribute to prevent native tooltip
                element.removeAttribute('title');
            }
        });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTooltips);
    } else {
        initTooltips();
    }
})();

