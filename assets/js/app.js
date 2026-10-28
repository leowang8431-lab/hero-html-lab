/* DRY：四个页面共用同一份导航栏和页脚。 */
(() => {
  'use strict';
  const pages = [
    { id: 'home', href: 'index.html', label: 'Home' },
    { id: 'quotes', href: 'quotes.html', label: 'Quotes' },
    { id: 'projects', href: 'projects.html', label: 'Projects' },
    { id: 'machine', href: 'machine.html', label: 'Game' }
  ];
  const header = document.getElementById('site-header');
  const current = document.body.dataset.page;
  if (header) header.innerHTML = `<nav id="main-nav" aria-label="Main navigation">${pages.map(page => `<a href="${page.href}"${current === page.id ? ' aria-current="page"' : ''}>${page.label}</a>`).join('')}<button id="theme-toggle" type="button" role="switch" aria-label="Switch to dark mode" aria-checked="false"><span class="theme-knob" aria-hidden="true"></span></button></nav>`;
  const toggle = document.getElementById('theme-toggle');
  function syncTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    if (toggle) {
      toggle.setAttribute('aria-checked', String(dark));
      toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      toggle.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#14161a' : '#faf7f2';
  }
  if (toggle) toggle.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('hero-home-theme', theme); } catch (_) { /* 本次切换仍可用 */ }
    syncTheme();
  });
  syncTheme();
  const footer = document.getElementById('site-footer');
  if (footer) footer.innerHTML = '<p>© 2026 Hero Home · My Hero Website</p><p>A final project made with HTML, CSS and JavaScript.</p>';
})();
