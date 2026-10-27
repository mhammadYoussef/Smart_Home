// Loaded in <head> before the stylesheet paints, so the saved (or system) theme applies without a flash.
(function () {
  let theme = null;
  try { theme = localStorage.getItem('smart-home-theme'); } catch {}
  if (theme !== 'light' && theme !== 'dark') theme = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
})();
