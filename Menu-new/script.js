(function() {
  function initNavbar() {
    const navbar = document.querySelector('nav.navbar');
    const dropbtn = navbar?.querySelector('.dropbtn');

    if (!navbar || !dropbtn) return;

    // Expand on hover over menu button
    dropbtn.addEventListener('mouseenter', () => {
      navbar.classList.add('navbar-expanded');
    });

    // Collapse when mouse leaves navbar
    navbar.addEventListener('mouseleave', () => {
      navbar.classList.remove('navbar-expanded');
    });

    // Escape key to collapse
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        navbar.classList.remove('navbar-expanded');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }

  // Mirror Astro page-load hook (safe no-op here)
  document.addEventListener('astro:page-load', initNavbar);
})();
