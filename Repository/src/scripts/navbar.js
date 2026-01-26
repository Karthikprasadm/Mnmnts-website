let navbarListenersBound = false;

const initNavbar = () => {
  const navbar = document.querySelector('nav.navbar');
  const dropbtn = navbar?.querySelector('.dropbtn');

  if (!navbar || !dropbtn) return;
  if (navbar.dataset.navbarInit === 'true') return;
  navbar.dataset.navbarInit = 'true';

  dropbtn.addEventListener('mouseenter', () => {
    navbar.classList.add('navbar-expanded');
  });

  navbar.addEventListener('mouseleave', () => {
    navbar.classList.remove('navbar-expanded');
  });

  if (!navbarListenersBound) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        navbar.classList.remove('navbar-expanded');
      }
    });
    navbarListenersBound = true;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavbar);
} else {
  initNavbar();
}

document.addEventListener('astro:page-load', initNavbar);

