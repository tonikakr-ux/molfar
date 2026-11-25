/* Molfar — система руху: поява при скролі (один раз), лічильники статистики,
   дужки «Креслення», лінія прогресу читання. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  root.classList.add('mo-ready');

  /* --- дужки: розбити рамку на 4 кути, щоб кожен креслився окремо --- */
  var NS = 'http://www.w3.org/2000/svg', D = ['M1 7V1h6', 'M33 1h6v6', 'M39 33v6h-6', 'M7 39H1v-6'];
  function frame() {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'c'); svg.setAttribute('viewBox', '0 0 40 40'); svg.setAttribute('aria-hidden', 'true');
    D.forEach(function (d) { var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor'); p.setAttribute('stroke-width', '1.33'); svg.appendChild(p); });
    return svg;
  }
  $$('svg.c').forEach(function (old) { old.parentNode.replaceChild(frame(), old); });
  $$('#v2-services summary > svg.plus').forEach(function (plus) {
    var box = document.createElement('span'); box.className = 'brk-s';
    plus.parentNode.insertBefore(box, plus); box.appendChild(frame()); box.appendChild(plus);
    plus.removeAttribute('style');
  });

  /* --- лінія прогресу читання --- */
  var bar = document.createElement('div'); bar.className = 'mo-progress'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var ticking = false;
  function progress() {
    var h = root.scrollHeight - root.clientHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, root.scrollTop / h) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(progress); } }, { passive: true });
  window.addEventListener('resize', progress); progress();

  /* --- статистика: підготувати лічильники --- */
  var stats = $$('.ab-hv [style*="min-height:240px"]').map(function (card) {
    var b = card.querySelector('b'), txt = b && b.firstChild;
    if (!txt || txt.nodeType !== 3) return null;
    var raw = txt.textContent.trim(), to = parseFloat(raw), dec = (raw.split('.')[1] || '').length;
    var plus = b.querySelector('span'); if (plus && plus.textContent.trim()) plus.classList.add('mo-plus'); else plus = null;
    var line = document.createElement('i'); line.className = 'mo-line'; card.appendChild(line);
    card.classList.add('mo-stat');
    return { card: card, txt: txt, to: to, dec: dec, plus: plus, line: line };
  }).filter(Boolean);
  function finalStats() { stats.forEach(function (s) { s.txt.textContent = s.to.toFixed(s.dec); s.line.style.transform = 'none'; if (s.plus) s.plus.classList.add('on'); }); }
  function runStats() {
    var ease = function (t) { return 1 - Math.pow(1 - t, 4); };
    stats.forEach(function (s, i) {
      s.txt.textContent = (0).toFixed(s.dec);
      var start = performance.now() + i * 120, dur = 1400;
      (function tick(now) {
        var t = Math.min(1, Math.max(0, (now - start) / dur)), e = ease(t);
        s.txt.textContent = (s.to * e).toFixed(s.dec);
        s.line.style.transform = 'scaleX(' + e + ')';
        if (t < 1) requestAnimationFrame(tick); else if (s.plus) s.plus.classList.add('on');
      })(performance.now());
    });
  }

  if (reduce) { root.classList.remove('mo'); finalStats(); return; }

  /* --- розмітити, що анімується --- */
  function mark(sel, type) { $$(sel).forEach(function (el) { el.setAttribute('data-mo', type); }); }
  mark('.ab-hv [style*="min-height:240px"], #v2-about p, #v2-services details, .pf-row, .ind-track, .tk-bar, .ai-row, ' +
       '.sa-row, #v2-testimonials .wrap > div:nth-child(2), .tc-col, .lg-mq, .pl-tile, .fd, details.fq, .seo-box, ' +
       '.ft > div:first-child > div, .fl6 > div > div, #v2-quiz .wrap > div:nth-child(2)', 'rise');
  var g0 = document.querySelector('.tk-grid'); if (g0) g0.setAttribute('data-mo', 'rise');
  mark('.sa-ph, .fd > div:first-child > div:first-child', 'photo');
  mark('.pf-imgs', 'wipe');
  mark('.st a[href="https://clutch.co"]', 'slide');

  /* затримки по черзі всередині групи (60–80 мс, не більше 6 кроків) */
  var groups = new Map();
  $$('[data-mo]').forEach(function (el) {
    var p = el.parentElement, n = groups.get(p) || 0; groups.set(p, n + 1);
    if (n) el.classList.add('mo-d' + Math.min(n, 6));
  });

  /* поява: елемент стартує, коли його верх перетинає лінію на 80% висоти екрана
     (тобто вже видно нижню п'ятину). Перевірка по скролу, лише для ще не показаних. */
  var pending = $$('[data-mo], .ey, section h2, .st h1');
  var TRIGGER = 0.8;
  function reveal(el) {
    el.classList.add('in');
    if (el.classList.contains('mo-stat') && !runStats.done) { runStats.done = true; runStats(); }
    var last = el.matches('h1, h2') && el.querySelector(':scope > span') ? el.querySelector(':scope > span') : el;
    last.addEventListener('animationend', function () { el.classList.add('mo-done'); }, { once: true });
  }
  var queued = false;
  function check() {
    queued = false;
    var line = window.innerHeight * TRIGGER;
    pending = pending.filter(function (el) {
      if (!el.offsetParent && el.tagName !== 'BODY') return true;
      var r = el.getBoundingClientRect();
      if (r.top < line && r.bottom > 0) { reveal(el); return false; }
      if (r.bottom <= 0) { el.classList.add('in', 'mo-done'); if (el.classList.contains('mo-stat')) finalStats(); return false; }
      return true;
    });
    if (!pending.length) { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); }
  }
  function onScroll() { if (!queued) { queued = true; requestAnimationFrame(check); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  document.addEventListener('click', function () { setTimeout(onScroll, 50); }, true);
  check();

  /* технології: хвиля плиток під час перемикання вкладки */
  $$('.tk-grid').forEach(function (g) { $$('.tl-tile', g).forEach(function (t, i) { t.style.setProperty('--i', i); }); });
  $$('.tk-tabs .tc-tab').forEach(function (t, i) {
    t.addEventListener('click', function () {
      var g = $$('.tk-grid')[i]; if (!g) return;
      g.classList.remove('mo-swap'); void g.offsetWidth; g.classList.add('mo-swap');
    });
  });
})();
