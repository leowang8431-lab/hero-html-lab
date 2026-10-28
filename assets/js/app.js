/* DRY：所有页面共用这一份导航与页脚，无需重复编写导航 HTML。 */
(() => {
  'use strict';
  const pages = [
    { id: 'home', href: 'index.html', label: '首页', en: 'HOME' },
    { id: 'quotes', href: 'quotes.html', label: '名言宇宙', en: 'QUOTES' },
    { id: 'projects', href: 'projects.html', label: '创意工坊', en: 'PROJECTS' },
    { id: 'machine', href: 'machine.html', label: '游戏实验室', en: 'MACHINE' }
  ];
  const current = document.body.dataset.page;
  const header = document.getElementById('site-header');
  if (header) header.innerHTML = `<div class="container header-inner"><a class="brand" href="index.html" aria-label="HERO LAB 首页"><span class="brand-mark">H<span>╱</span></span><span>HERO LAB<small>英雄学习基地</small></span></a><button class="menu-toggle" type="button" aria-controls="main-nav" aria-expanded="false" aria-label="展开导航"><span></span><span></span></button><nav id="main-nav" aria-label="主要导航">${pages.map(page => `<a href="${page.href}"${page.id === current ? ' aria-current="page"' : ''}>${page.label}<span>${page.en}</span></a>`).join('')}</nav><a class="header-play" href="machine.html">LET’S PLAY <span aria-hidden="true">↗</span></a></div>`;
  const toggle = document.querySelector('.menu-toggle');
  if (toggle) toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? '展开导航' : '收起导航');
    header.classList.toggle('menu-open', !open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle && toggle.getAttribute('aria-expanded') === 'true') { toggle.click(); toggle.focus(); }
  });
  const footer = document.getElementById('site-footer');
  if (footer) footer.innerHTML = `<div class="container footer-inner"><a class="brand footer-brand" href="index.html"><span class="brand-mark">H<span>╱</span></span><span>HERO LAB<small>KEEP LEARNING. KEEP CREATING.</small></span></a><p>从第一行代码，走向无限可能。<small>HTML / CSS / JAVASCRIPT · 学习与课程展示项目</small></p><a href="#main" class="back-top" aria-label="返回页面顶部">↑</a></div><div class="container footer-bottom"><span>© 2026 HERO LAB · 期末网页设计作业</span><span>角色素材来自提供的图片，仅用于课程学习展示。</span></div>`;
})();
