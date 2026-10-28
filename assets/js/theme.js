/* 在首次绘制前恢复主题，避免跨页面切换时闪烁。 */
(() => {
  let saved;
  try { saved = localStorage.getItem('hero-home-theme'); } catch (_) { /* 无存储权限 */ }
  const dark = saved === 'dark' || (saved !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = dark ? '#14161a' : '#faf7f2';
})();
