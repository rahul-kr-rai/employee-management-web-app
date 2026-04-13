/* =====================================================
   EMS — Shared Client JS
   Dark/Light mode toggle + Mobile sidebar nav
   ===================================================== */

(function () {
  /* ── Dark / Light Mode ── */
  const html   = document.documentElement;
  const toggle = document.getElementById('themeToggle');

  const saved  = localStorage.getItem('ems-theme') || 'light';
  html.setAttribute('data-theme', saved);
  if (toggle) toggle.textContent = saved === 'dark' ? '☀️' : '🌙';

  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('ems-theme', next);
      toggle.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }

  /* ── Mobile Nav ── */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = mobileNav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', (e) => {
      if (!mobileNav.contains(e.target) && e.target !== hamburger) {
        mobileNav.classList.remove('open');
      }
    });
  }

  /* ── Auto-dismiss alerts after 5s ── */
  document.querySelectorAll('.alert[data-auto-dismiss]').forEach(el => {
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, 5000);
  });
})();
