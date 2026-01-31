(function() {
  function initNavbar() {
    const navbar = document.querySelector('nav.navbar');
    const dropbtn = navbar ? navbar.querySelector('.dropbtn') : null;

    if (!navbar || !dropbtn) return;

    // Expand on hover over menu button (same as about page)
    dropbtn.addEventListener('mouseenter', function() {
      navbar.classList.add('navbar-expanded');
    });

    // Collapse when mouse leaves navbar
    navbar.addEventListener('mouseleave', function() {
      navbar.classList.remove('navbar-expanded');
    });

    // Escape key to collapse
    document.addEventListener('keydown', function(e) {
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

  document.addEventListener('astro:page-load', initNavbar);
})();
