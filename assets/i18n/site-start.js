/*
 * TulusSG main website: start the shared language engine (/campaigns/shared/i18n-core.js) once the page's
 * dictionaries are registered. The homepage starts it from its own script instead (it also re-renders texts its
 * script writes), so this file is for the other main pages.
 */
(function () {
  function go() { if (window.TulusI18n) window.TulusI18n.start(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
