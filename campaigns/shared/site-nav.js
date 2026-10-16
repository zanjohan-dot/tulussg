/*
 * Site menu for campaign pages (16 Oct 2026).
 * The campaign pages use their own template, so they never had the main TulusSG menu. This adds the same items as
 * the homepage menu (Mission, Our People, Activities, Get Involved, Connect, Campaigns) and a menu button on phones.
 * Kept in its own file because the campaign pages' Content Security Policy blocks inline scripts.
 * The menu links work without JavaScript; this file only opens and closes the phone menu.
 */
(function () {
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!btn || !nav) return;

  function setOpen(open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('open', open);
  }

  btn.addEventListener('click', function () {
    setOpen(btn.getAttribute('aria-expanded') !== 'true');
  });

  // Close after choosing a link, on Escape, and when the screen becomes wide enough to show the full menu.
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); }
  });
  var wide = window.matchMedia('(min-width: 880px)');
  var onWide = function () { if (wide.matches) setOpen(false); };
  if (wide.addEventListener) wide.addEventListener('change', onWide); else if (wide.addListener) wide.addListener(onWide);
})();
