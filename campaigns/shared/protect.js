/*
 * Campaign pages: DISCOURAGES casual copying of photos and text (16 Oct 2026). It does not, and cannot, stop anyone
 * from seeing or saving what a browser downloads (view-source, developer tools, screenshots). Real protection is on the
 * server: no secrets in these files, and registrations only reach the private Sheets through the API.
 *
 * - Right-click menu is turned off on photos and on ordinary page text.
 * - Still allowed everywhere it is needed: form fields, links, selected text (so people can copy or translate what
 *   they select), and the details people may need to copy: campaign dates, event facts, contact details, their
 *   registration reference, the footer. Mark any other element with data-copy-ok to allow it.
 * - Photos cannot be dragged out or long-pressed to save on phones (CSS in campaign.css).
 * - No keyboard shortcut is blocked, text selection is never blocked, and nothing changes for screen readers,
 *   zoom, the browser's own translate feature or the language menu.
 */
(function () {
  'use strict';
  var ALLOW = 'input, textarea, select, option, button, a, label, [contenteditable], [data-copy-ok], .period, .facts,'
    + ' .lang-wrap, footer, #success-reference, .success-reference, .notice';

  document.addEventListener('contextmenu', function (e) {
    var t = e.target && e.target.nodeType === 1 ? e.target : e.target && e.target.parentElement;
    if (!t) return;
    if (t.closest('img, picture, figure, .hero-photo, .card-img, .event-banner')) { e.preventDefault(); return; }
    if (t.closest(ALLOW)) return;
    var sel = window.getSelection && String(window.getSelection());
    if (sel && sel.trim()) return; // they selected something on purpose: let them copy or translate it
    e.preventDefault();
  });

  function lockImages(root) {
    var imgs = (root || document).querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) imgs[i].setAttribute('draggable', 'false');
  }
  lockImages();
  // Cards on /campaigns/ are built by script after load.
  if (window.MutationObserver) new MutationObserver(function () { lockImages(); }).observe(document.body, { childList: true, subtree: true });
})();
