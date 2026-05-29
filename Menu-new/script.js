(function() {
  function initNavbar() {
    const navbar = document.querySelector('nav.navbar');
    const dropbtn = navbar?.querySelector('.dropbtn');

    if (!navbar || !dropbtn) return;

    let closeTimer;

    // Expand on hover over menu button
    dropbtn.addEventListener('mouseenter', () => {
      clearTimeout(closeTimer);
      navbar.classList.add('navbar-expanded');
    });

    navbar.addEventListener('mouseenter', () => {
      clearTimeout(closeTimer);
    });

    // Collapse when mouse leaves navbar
    navbar.addEventListener('mouseleave', () => {
      closeTimer = setTimeout(() => {
        navbar.classList.remove('navbar-expanded');
      }, 110);
    });

    // Escape key to collapse
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        clearTimeout(closeTimer);
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
