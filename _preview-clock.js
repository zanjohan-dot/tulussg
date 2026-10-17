// PREVIEW ONLY. ?preview-date=YYYY-MM-DD pretends it is that day (00:00:05 Singapore time) so scheduled campaigns can be
// seen in each state. ?preview-view=thankyou shows the confirmation screen with a sample reference. Not on the live site.
(function () {
  var q = new URLSearchParams(location.search);
  var d = q.get('preview-date');
  if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    var t = Date.parse(d + 'T00:00:05+08:00');
    window.TULUS_NOW = function () { return t; };
  }
  if (q.get('preview-view') === 'thankyou') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () {
        var f = document.getElementById('form-view'), s = document.getElementById('success-view'), st = document.getElementById('status-view');
        if (!s) return;
        if (f) f.hidden = true; if (st) st.hidden = true; s.hidden = false;
        var row = document.getElementById('success-reference-row'); if (row) row.hidden = false;
        var ref = document.getElementById('success-reference'); if (ref) ref.textContent = 'SYM-PREVW1';
        s.scrollIntoView();
      }, 300);
    });
  }
})();
