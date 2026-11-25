/* Molfar — інтерактив головної: галузі, технології, «Як ми працюємо»,
   «Читати більше», дропдаун способу зв'язку, бургер, кнопка «вгору». */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var desktop = window.matchMedia('(min-width: 1024px)');

  /* Галузі: відкривається картка під курсором; без курсора — автоперемикання */
  var track = $('.ind-track');
  if (track) {
    var cards = $$('.ind-card', track), hovered = false, timer;
    track.classList.add('js');
    var open = function (c) { cards.forEach(function (x) { x.classList.toggle('on', x === c); }); };
    if (!cards.some(function (c) { return c.classList.contains('on'); })) open(cards[0]);
    cards.forEach(function (c) {
      c.addEventListener('mouseenter', function () { if (desktop.matches) open(c); });
      c.addEventListener('focus', function () { open(c); });
    });
    track.addEventListener('mouseenter', function () { hovered = true; });
    track.addEventListener('mouseleave', function () { hovered = false; });
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) timer = setInterval(function () {
      if (hovered || !desktop.matches || document.hidden) return;
      var i = cards.findIndex(function (c) { return c.classList.contains('on'); });
      open(cards[(i + 1) % cards.length]);
    }, 6000);
  }

  /* Технології: таби */
  var tabs = $$('.tk-tabs .tc-tab'), grids = $$('.tk-grid');
  tabs.forEach(function (t, i) {
    t.setAttribute('aria-selected', t.classList.contains('on'));
    t.addEventListener('click', function () {
      tabs.forEach(function (x, j) { x.classList.toggle('on', j === i); x.setAttribute('aria-selected', j === i); });
      grids.forEach(function (g, j) { g.style.display = j === i ? 'grid' : 'none'; });
    });
  });

  /* Як ми працюємо: кроки-акордеон (один відкритий) */
  var steps = $$('.sa-row');
  steps.forEach(function (r) {
    r.setAttribute('aria-expanded', r.classList.contains('on'));
    r.addEventListener('click', function () {
      steps.forEach(function (x) { var on = x === r; x.classList.toggle('on', on); x.setAttribute('aria-expanded', on); });
    });
  });

  /* SEO-блок: «Читати більше» */
  var seoBtn = $('.seo-btn'), seoBox = $('.seo-box');
  if (seoBtn && seoBox) seoBtn.addEventListener('click', function () {
    var o = seoBox.classList.toggle('open');
    seoBtn.textContent = o ? 'Згорнути −' : 'Читати більше +';
    seoBtn.setAttribute('aria-expanded', o);
  });

  /* Кнопка «вгору» */
  var up = $('.ft-up');
  if (up) up.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* Дропдаун «Як з вами зв'язатися?» у фірмовому стилі (нативний select лишається для форми) */
  $$('select#f-contact').forEach(function (sel) {
    var wrap = document.createElement('div'); wrap.className = 'dd';
    sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel);
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'dd-btn';
    btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
    var lbl = sel.id && $('label[for="' + sel.id + '"]'); if (lbl) { lbl.id = lbl.id || sel.id + '-l'; btn.setAttribute('aria-labelledby', lbl.id + ' ' + sel.id + '-v'); }
    var val = document.createElement('span'); val.id = sel.id + '-v'; btn.appendChild(val);
    btn.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" fill="currentColor"/></svg>');
    var list = document.createElement('ul'); list.className = 'dd-list'; list.setAttribute('role', 'listbox'); list.tabIndex = -1;
    var opts = Array.prototype.map.call(sel.options, function (o, i) {
      var li = document.createElement('li'); li.className = 'dd-opt'; li.setAttribute('role', 'option');
      li.textContent = o.textContent; li.addEventListener('click', function () { pick(i); close(); btn.focus(); });
      li.addEventListener('mousemove', function () { hl(i); });
      list.appendChild(li); return li;
    });
    wrap.appendChild(btn); wrap.appendChild(list); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    var cur = sel.selectedIndex;
    function pick(i) { sel.selectedIndex = i; val.textContent = sel.options[i].textContent; opts.forEach(function (o, j) { o.setAttribute('aria-selected', j === i); }); sel.dispatchEvent(new Event('change', { bubbles: true })); }
    function hl(i) { cur = i; opts.forEach(function (o, j) { o.classList.toggle('hl', j === i); }); }
    function openL() { wrap.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); hl(sel.selectedIndex); }
    function close() { wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    pick(sel.selectedIndex);
    btn.addEventListener('click', function () { wrap.classList.contains('open') ? close() : openL(); });
    btn.addEventListener('keydown', function (e) {
      var o = wrap.classList.contains('open');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!o) return openL(); hl((cur + (e.key === 'ArrowDown' ? 1 : opts.length - 1)) % opts.length); }
      else if ((e.key === 'Enter' || e.key === ' ') && o) { e.preventDefault(); pick(cur); close(); }
      else if (e.key === 'Escape') close();
    });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) close(); });
  });
})();
