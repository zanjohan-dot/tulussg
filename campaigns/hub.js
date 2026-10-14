/*
 * /campaigns/ hub — builds one card per campaign from /campaigns/campaigns.js, in the chosen language.
 * Hidden campaigns are never shown. Only 'active' campaigns get a call-to-action link.
 */
(function () {
  'use strict';

  var t = TulusI18n.t;
  var grid = document.getElementById('campaign-grid');
  var empty = document.getElementById('hub-empty');
  var campaigns = (window.TULUS_CAMPAIGNS || [])
    .filter(function (c) { return c.status !== 'hidden'; })
    .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function card(c) {
    var active = c.status === 'active';
    var key = 'campaign.' + c.slug + '.';
    var li = el('li');
    // Active cards are one big link; others are plain cards with no registration call-to-action.
    var box = el(active ? 'a' : 'div', 'campaign-card' + (active ? '' : ' is-' + c.status));
    if (active) box.href = TulusI18n.withLang('/campaigns/' + c.slug + '/');

    var media = el('div', 'card-img');
    var picture = el('picture');
    var source = el('source');
    source.type = 'image/webp';
    source.srcset = c.image;
    var img = el('img');
    img.src = c.imageFallback || c.image;
    img.alt = t(key + 'alt');
    img.loading = 'lazy';
    img.style.objectPosition = c.imageFocus || '50% 50%';
    picture.appendChild(source);
    picture.appendChild(img);
    media.appendChild(picture);

    var body = el('div', 'card-body');
    body.appendChild(el('span', 'status-pill status-' + c.status, t('status.' + c.status)));
    body.appendChild(el('h2', null, t(key + 'title')));
    body.appendChild(el('p', null, t(key + 'desc')));
    if (active) body.appendChild(el('span', 'btn', t(key + 'cta')));

    box.appendChild(media);
    box.appendChild(body);
    li.appendChild(box);
    return li;
  }

  function render() {
    grid.textContent = '';
    campaigns.forEach(function (c) { grid.appendChild(card(c)); });
    empty.hidden = campaigns.length > 0;
  }

  TulusI18n.onChange(render);
  TulusI18n.start();
})();
