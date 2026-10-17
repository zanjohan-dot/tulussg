/*
 * /campaigns/ — Campaigns & Events directory. Everything here is built from the register in /campaigns/campaigns.js:
 * sections (Upcoming & Ongoing / Coming Soon / Past), status, date line, filters and the month calendar.
 * Adding an event never needs a change in this file or in the page's HTML (see the top of campaigns.js).
 *
 * Dates are Singapore calendar dates. Only confirmed dates are placed on the calendar.
 */
(function () {
  'use strict';

  var t = TulusI18n.t;
  var D = window.TULUS_DATES;
  var root = document.getElementById('directory');
  var CATS = ['sports', 'stories', 'learning', 'community'];
  var state = { view: 'cards', cat: 'all', month: null };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function nowMs() { return typeof window.TULUS_NOW === 'function' ? window.TULUS_NOW() : Date.now(); }
  function href(c) { return TulusI18n.withLang('https://raw.githack.com/zanjohan-dot/tulussg/preview-review-2026-10-17-v15/campaigns/' + c.slug + '/index.html'); }

  // ---- dates in the chosen language (month names and word order come from /campaigns/i18n.js)
  function parts(ymd) { var p = ymd.split('-'); return { Y: p[0], m: +p[1], d: +p[2] }; }
  // Numbers in the language's own digits when it has them (date.digits: ten characters, e.g. Bengali); else 0-9.
  function num(n) {
    var dg = t('date.digits');
    return dg && dg.length === 10 ? String(n).replace(/[0-9]/g, function (c) { return dg.charAt(+c); }) : String(n);
  }
  function fill(pattern, ymd) {
    var p = parts(ymd);
    return pattern.replace('{Y}', num(p.Y)).replace('{M}', t('date.months').split(',')[p.m - 1]).replace('{d}', num(p.d));
  }
  function full(ymd) { return fill(t('date.full'), ymd); }
  function short(ymd) { return fill(t('date.short'), ymd); }
  function range(a, b) {
    if (a === b) return full(a);
    if (a.slice(0, 4) !== b.slice(0, 4)) return full(a) + ' – ' + full(b);
    return t('date.range').replace('{f1}', full(a)).replace('{s1}', short(a)).replace('{f2}', full(b)).replace('{s2}', short(b));
  }
  function dateLine(c) {
    if (c.eventDate) return full(c.eventDate);
    if (c.period) return range(c.period.start, c.period.end);
    if (c.opensAt && c.closesAt) return range(D.sgDate(Date.parse(c.opensAt)), D.sgDate(Date.parse(c.closesAt) - 1));
    return t('card.dateTbc');
  }
  function statusPill(s) { return el('span', 'status-pill status-' + s, t(s === 'open' ? 'status.active' : 'status.' + s)); }

  // ---- data
  function items() {
    var now = nowMs();
    return (window.TULUS_CAMPAIGNS || []).map(function (c) {
      return Object.assign({}, c, { pub: window.TULUS_PUBLIC_STATUS(c, now), section: window.TULUS_SECTION(c, now) });
    }).filter(function (c) { return c.section; });
  }
  function byStart(a, b) {
    var x = D.firstDay(a) || '9999', y = D.firstDay(b) || '9999';
    return x < y ? -1 : x > y ? 1 : (a.order || 0) - (b.order || 0);
  }
  function byEndDesc(a, b) {
    var x = D.lastDay(a) || '', y = D.lastDay(b) || '';
    return x < y ? 1 : x > y ? -1 : (a.order || 0) - (b.order || 0);
  }

  // ---- cards
  function picture(c, className) {
    var media = el('div', className);
    var pic = el('picture');
    if (c.imageFallback) { var source = el('source'); source.type = 'image/webp'; source.srcset = c.image; pic.appendChild(source); }
    var img = el('img');
    img.src = c.imageFallback || c.image;
    img.alt = t('campaign.' + c.slug + '.alt');
    img.loading = 'lazy';
    img.style.objectPosition = c.imageFocus || '50% 50%';
    pic.appendChild(img);
    media.appendChild(pic);
    return media;
  }
  function card(c) {
    var li = el('li');
    var box = el('a', 'campaign-card' + (c.pub === 'open' ? '' : ' is-' + c.pub));
    box.href = TulusI18n.withLang('https://raw.githack.com/zanjohan-dot/tulussg/preview-review-2026-10-17-v15/campaigns/' + c.slug + '/index.html');
    box.appendChild(picture(c, 'card-img'));
    var body = el('div', 'card-body');
    var meta = el('div', 'card-meta');
    meta.appendChild(statusPill(c.pub));
    meta.appendChild(el('span', 'card-cat', t('cat.' + c.category)));
    body.appendChild(meta);
    body.appendChild(el('h3', null, t('campaign.' + c.slug + '.title')));
    body.appendChild(el('p', 'card-date', dateLine(c)));
    // Audience is in the register (for a future filter); the card titles already name who each campaign is for.
    body.appendChild(el('span', c.pub === 'open' ? 'btn' : 'btn btn-outline', t('card.view')));
    box.appendChild(body);
    li.appendChild(box);
    return li;
  }
  function archiveRow(c) {
    var li = el('li');
    var a = el('a', 'archive-row');
    a.href = href(c);
    a.appendChild(picture(c, 'archive-img'));
    var txt = el('span', 'archive-text');
    txt.appendChild(el('span', 'archive-title', t('campaign.' + c.slug + '.title')));
    txt.appendChild(el('span', 'archive-date', dateLine(c) + ' · ' + t('cat.' + c.category)));
    a.appendChild(txt);
    a.appendChild(statusPill(c.pub));
    li.appendChild(a);
    return li;
  }
  function section(id, list, builder, listClass) {
    var sec = el('section', 'dir-section');
    sec.setAttribute('aria-labelledby', 'sec-' + id);
    var h = el('h2', 'dir-heading', t('sec.' + id));
    h.id = 'sec-' + id;
    sec.appendChild(h);
    var ul = el('ul', listClass);
    list.forEach(function (c) { ul.appendChild(builder(c)); });
    sec.appendChild(ul);
    return sec;
  }

  // ---- calendar: start / last day of a campaign period, registration window if different, event day
  function markers(list) {
    var out = [];
    function add(ymd, kind, c) { if (ymd) out.push({ day: ymd, kind: kind, c: c }); }
    list.forEach(function (c) {
      var ps = c.period && c.period.start, pe = c.period && c.period.end;
      add(ps, 'starts', c);
      add(pe, 'ends', c);
      var ro = c.opensAt && D.sgDate(Date.parse(c.opensAt));
      var rc = c.closesAt && D.sgDate(Date.parse(c.closesAt) - 1);
      if (ro && ro !== ps) add(ro, 'regOpens', c);
      if (rc && rc !== pe) add(rc, 'regCloses', c);
      add(c.eventDate, 'event', c);
    });
    return out.sort(function (a, b) { return a.day < b.day ? -1 : a.day > b.day ? 1 : (a.c.order || 0) - (b.c.order || 0); });
  }
  function monthOf(ymd) { return ymd.slice(0, 7); }
  function addMonth(ym, n) {
    var y = +ym.slice(0, 4), m = +ym.slice(5, 7) - 1 + n;
    y += Math.floor(m / 12); m = ((m % 12) + 12) % 12;
    return y + '-' + (m < 9 ? '0' : '') + (m + 1);
  }
  function calendar(list) {
    var ms = markers(list);
    var today = D.sgDate(nowMs());
    var months = ms.map(function (x) { return monthOf(x.day); });
    var cur = monthOf(today);
    var first = months.length ? (months[0] < cur ? months[0] : cur) : cur;
    var last = months.length ? (months[months.length - 1] > cur ? months[months.length - 1] : cur) : cur;
    if (!state.month || state.month < first || state.month > last) {
      // Open on this month if something is on it, otherwise on the next month that has something.
      var next = months.filter(function (m) { return m >= cur; })[0];
      state.month = months.indexOf(cur) !== -1 ? cur : (next || cur);
    }
    var ym = state.month;
    var wrap = el('section', 'cal');
    wrap.setAttribute('aria-labelledby', 'cal-title');

    var head = el('div', 'cal-head');
    var prev = el('button', 'cal-nav', '‹');
    prev.type = 'button'; prev.setAttribute('aria-label', t('cal.prev')); prev.disabled = ym <= first;
    var next2 = el('button', 'cal-nav', '›');
    next2.type = 'button'; next2.setAttribute('aria-label', t('cal.next')); next2.disabled = ym >= last;
    var title = el('h2', 'cal-title', fill(t('date.month'), ym + '-01'));
    title.id = 'cal-title';
    title.setAttribute('aria-live', 'polite');
    prev.addEventListener('click', function () { state.month = addMonth(ym, -1); render(); focusNav('prev'); });
    next2.addEventListener('click', function () { state.month = addMonth(ym, 1); render(); focusNav('next'); });
    prev.dataset.nav = 'prev'; next2.dataset.nav = 'next';
    head.appendChild(prev); head.appendChild(title); head.appendChild(next2);
    wrap.appendChild(head);

    // Month grid (visual overview; the list below it is the accessible version with every link)
    var grid = el('div', 'cal-grid');
    grid.setAttribute('aria-hidden', 'true');
    t('date.weekdays').split(',').forEach(function (w) { grid.appendChild(el('span', 'cal-wd', w)); });
    var startDow = new Date(Date.parse(ym + '-01T00:00:00Z')).getUTCDay(); // Sunday = 0
    var y = +ym.slice(0, 4), m = +ym.slice(5, 7);
    var days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    for (var i = 0; i < startDow; i++) grid.appendChild(el('span', 'cal-day is-empty'));
    for (var d = 1; d <= days; d++) {
      var ymd = ym + '-' + (d < 10 ? '0' : '') + d;
      var cell = el('div', 'cal-day' + (ymd === today ? ' is-today' : ''));
      cell.appendChild(el('span', 'cal-num', num(d)));
      ms.filter(function (x) { return x.day === ymd; }).forEach(function (x) {
        var chip = el('a', 'cal-chip kind-' + x.kind + ' st-' + x.c.pub);
        chip.href = href(x.c);
        chip.tabIndex = -1;
        chip.appendChild(el('span', 'cal-chip-text', t('campaign.' + x.c.slug + '.title')));
        cell.appendChild(chip);
      });
      grid.appendChild(cell);
    }
    wrap.appendChild(grid);

    // Agenda for the month
    var monthMs = ms.filter(function (x) { return monthOf(x.day) === ym; });
    if (!monthMs.length) wrap.appendChild(el('p', 'cal-empty', t('cal.empty')));
    else {
      var ol = el('ol', 'cal-agenda');
      monthMs.forEach(function (x) {
        var li = el('li');
        var a = el('a', 'cal-item kind-' + x.kind);
        a.href = href(x.c);
        var day = el('span', 'cal-item-date');
        var dow = new Date(Date.parse(x.day + 'T00:00:00Z')).getUTCDay();
        day.appendChild(el('span', 'cal-item-dow', t('date.weekdays').split(',')[dow]));
        day.appendChild(el('span', 'cal-item-num', num(parts(x.day).d)));
        a.appendChild(day);
        var txt = el('span', 'cal-item-text');
        txt.appendChild(el('span', 'cal-item-kind', t('kind.' + x.kind)));
        txt.appendChild(el('span', 'cal-item-title', t('campaign.' + x.c.slug + '.title')));
        a.appendChild(txt);
        a.appendChild(statusPill(x.c.pub));
        li.appendChild(a);
        ol.appendChild(li);
      });
      wrap.appendChild(ol);
    }
    return wrap;
  }
  function focusNav(which) {
    var b = root.querySelector('.cal-nav[data-nav="' + which + '"]');
    if (b && !b.disabled) b.focus(); else { var tt = document.getElementById('cal-title'); if (tt) { tt.tabIndex = -1; tt.focus(); } }
  }

  // ---- controls
  function toggleGroup(label, options, current, onPick) {
    var g = el('div', 'dir-toggle');
    g.setAttribute('role', 'group');
    g.setAttribute('aria-label', label);
    options.forEach(function (o) {
      var b = el('button', 'dir-btn', o.text);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(o.value === current));
      b.addEventListener('click', function () { onPick(o.value); render(); var again = root.querySelector('[data-group="' + label + '"] [aria-pressed="true"]'); if (again) again.focus(); });
      g.appendChild(b);
    });
    g.dataset.group = label;
    return g;
  }

  function render() {
    var all = items();
    var used = CATS.filter(function (k) { return all.some(function (c) { return c.category === k; }); });
    if (used.indexOf(state.cat) === -1) state.cat = 'all';
    var list = all.filter(function (c) { return state.cat === 'all' || c.category === state.cat; });

    root.textContent = '';
    var bar = el('div', 'dir-bar');
    bar.appendChild(toggleGroup(t('view.label'), [{ value: 'cards', text: t('view.cards') }, { value: 'calendar', text: t('view.calendar') }],
      state.view, function (v) { state.view = v; }));
    // Filters only when there is something to filter (two or more categories in use).
    if (used.length > 1) {
      bar.appendChild(toggleGroup(t('filter.label'), [{ value: 'all', text: t('filter.all') }].concat(used.map(function (k) { return { value: k, text: t('cat.' + k) }; })),
        state.cat, function (v) { state.cat = v; }));
    }
    root.appendChild(bar);

    if (state.view === 'calendar') { root.appendChild(calendar(list)); return; }

    var up = list.filter(function (c) { return c.section === 'upcoming'; }).sort(byStart);
    var soon = list.filter(function (c) { return c.section === 'soon'; }).sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    var past = list.filter(function (c) { return c.section === 'past'; }).sort(byEndDesc);
    if (up.length) root.appendChild(section('upcoming', up, card, 'campaign-grid'));
    if (soon.length) root.appendChild(section('soon', soon, card, 'campaign-grid'));
    if (past.length) {
      var det = el('details', 'dir-section archive');
      var sum = el('summary', 'dir-heading');
      sum.appendChild(el('span', null, t('sec.past')));
      sum.appendChild(el('span', 'archive-count', '(' + past.length + ')'));
      det.appendChild(sum);
      var ul = el('ul', 'archive-list');
      past.forEach(function (c) { ul.appendChild(archiveRow(c)); });
      det.appendChild(ul);
      root.appendChild(det);
    }
    if (!up.length && !soon.length && !past.length) root.appendChild(el('p', 'hub-empty', t('hub.empty')));
  }

  var fallback = document.getElementById('directory-static');
  if (fallback) fallback.hidden = true;
  root.hidden = false;
  TulusI18n.onChange(render);
  TulusI18n.start();
})();
