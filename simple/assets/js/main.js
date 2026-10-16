/* Maison Babel (simple) — light, practical interactions. No dependencies. */
(function () {
  'use strict';
  var I = window.I18N;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LOC = { ru: 'ru-RU', en: 'en-GB', ky: 'ky-KG' };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function loc() { return LOC[I.lang] || 'ru-RU'; }

  var NAMES = {
    ru: { ru: 'русский', en: 'Russian', ky: 'орус тили' }, en: { ru: 'английский', en: 'English', ky: 'англис тили' },
    ky: { ru: 'кыргызский', en: 'Kyrgyz', ky: 'кыргыз тили' }, fr: { ru: 'французский', en: 'French', ky: 'француз тили' },
    ja: { ru: 'японский', en: 'Japanese', ky: 'жапон тили' }, zh: { ru: 'китайский', en: 'Chinese', ky: 'кытай тили' },
    es: { ru: 'испанский', en: 'Spanish', ky: 'испан тили' }, ar: { ru: 'арабский', en: 'Arabic', ky: 'араб тили' },
    de: { ru: 'немецкий', en: 'German', ky: 'немис тили' }, ko: { ru: 'корейский', en: 'Korean', ky: 'корей тили' },
    tr: { ru: 'турецкий', en: 'Turkish', ky: 'түрк тили' }
  };
  var G = [
    { w: 'Hello', l: 'en', tr: 'həˈləʊ' }, { w: 'Привет', l: 'ru', tr: 'privét' }, { w: 'Салам', l: 'ky', tr: 'salam' },
    { w: '안녕하세요', l: 'ko', tr: 'annyeonghaseyo' }, { w: '你好', l: 'zh', tr: 'nǐ hǎo' }, { w: 'Hallo', l: 'de', tr: 'ˈhalo' },
    { w: 'Merhaba', l: 'tr', tr: 'merhaba' }, { w: 'こんにちは', l: 'ja', tr: 'konnichiwa' }, { w: 'Bonjour', l: 'fr', tr: 'bɔ̃ʒuʁ' },
    { w: 'Hola', l: 'es', tr: 'ˈola' }, { w: 'مرحبا', l: 'ar', tr: 'marḥaban' }
  ];
  function nameOf(l) { var n = NAMES[l]; return n ? n[I.lang] || n.ru : l; }

  /* Letter-by-letter word render (Arabic stays whole to keep letters joined) */
  function renderWord(el, g, animate) {
    if (!el) return;
    el.setAttribute('lang', g.l);
    el.setAttribute('dir', g.l === 'ar' ? 'rtl' : 'ltr');
    if (!animate || REDUCED || g.l === 'ar') { el.textContent = g.w; if (animate && !REDUCED) { el.innerHTML = '<span class="ch" style="--i:0">' + esc(g.w) + '</span>'; } return; }
    el.innerHTML = Array.from(g.w).map(function (c, i) { return '<span class="ch" style="--i:' + i + '">' + (c === ' ' ? '&nbsp;' : esc(c)) + '</span>'; }).join('');
  }
  function swapWord(el, g) {
    if (!el) return;
    if (REDUCED) { renderWord(el, g, false); return; }
    el.classList.add('is-out');
    setTimeout(function () { el.classList.remove('is-out'); renderWord(el, g, true); }, 330);
  }

  /* Hero greeting cycle (headline + red card share the same word) */
  var gi = 0, gTimer = 0, heroVisible = true;
  function setCard(animate) {
    var g = G[gi];
    if (animate) swapWord($('#cardWord'), g); else renderWord($('#cardWord'), g, false);
    $('#cardTr').textContent = '[' + g.tr + ']';
    $('#cardLang').textContent = nameOf(g.l);
    $$('#cardDots i').forEach(function (d, k) { d.classList.toggle('on', k === gi); });
  }
  function step() {
    gi = (gi + 1) % G.length;
    swapWord($('#heroWord'), G[gi]);
    setCard(true);
  }
  function initHero() {
    $('#cardDots').innerHTML = G.map(function () { return '<i></i>'; }).join('');
    renderWord($('#heroWord'), G[gi], false);
    setCard(false);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; }).observe($('.hero'));
    gTimer = setInterval(function () { if (heroVisible && !document.hidden) step(); }, REDUCED ? 4000 : 2600);
  }

  /* Marquee */
  function buildMarquee() {
    var row = G.map(function (g) {
      return '<span class="marquee__item"><span lang="' + g.l + '"' + (g.l === 'ar' ? ' dir="rtl"' : '') + '>' + esc(g.w) + '</span><small>' + esc(nameOf(g.l)) + '</small></span>';
    }).join('');
    $('#marquee').innerHTML = row + row + row + row;
  }

  /* Upcoming groups + teachers */
  function renderGroups() {
    $$('#groups li').forEach(function (li) {
      var d = new Date(li.getAttribute('data-start') + 'T12:00:00'), s;
      try { s = new Intl.DateTimeFormat(loc(), { day: 'numeric', month: 'long' }).format(d); } catch (e) { s = d.toLocaleDateString(); }
      li.querySelector('.groups__start').textContent = I.t('g.start') + ' · ' + s;
      li.querySelector('.groups__seats').textContent = I.format('g.seats', { n: li.getAttribute('data-seats') });
    });
    $$('.teacher__x').forEach(function (p) { p.textContent = I.format('tc.exp', { n: p.getAttribute('data-exp') }); });
    $$('.avatar').forEach(function (a) { a.textContent = a.getAttribute('data-initials'); });
  }

  /* Reveal on scroll with sibling stagger */
  function initReveal() {
    var els = $$('.rv');
    els.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('rv'); });
      el.style.setProperty('--d', (Math.min(sibs.indexOf(el), 6) * 0.07).toFixed(2) + 's');
    });
    if (REDUCED || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* Counters */
  function fmtNum(v, d) { try { return Number(v).toLocaleString(loc(), { minimumFractionDigits: d, maximumFractionDigits: d }); } catch (e) { return Number(v).toFixed(d); } }
  function initCounters() {
    var els = $$('[data-count]');
    function final(el) { el.textContent = fmtNum(+el.getAttribute('data-count'), +(el.getAttribute('data-decimals') || 0)); el._done = true; }
    if (REDUCED || !('IntersectionObserver' in window)) { els.forEach(final); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, to = +el.getAttribute('data-count'), d = +(el.getAttribute('data-decimals') || 0), t0 = performance.now(), dur = 1600;
        (function tick(now) {
          var p = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - p, 3);
          el.textContent = fmtNum(to * k, d);
          if (p < 1) requestAnimationFrame(tick); else final(el);
        })(t0);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { el.textContent = fmtNum(0, +(el.getAttribute('data-decimals') || 0)); io.observe(el); });
  }
  function reformatCounters() { $$('[data-count]').forEach(function (el) { if (el._done || REDUCED) el.textContent = fmtNum(+el.getAttribute('data-count'), +(el.getAttribute('data-decimals') || 0)); }); }

  /* Tabs */
  function initTabs() {
    var tabs = $$('[role="tab"]'), ink = $('.tabs__ink');
    function moveInk() {
      var cur = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0];
      if (!cur || !ink) return;
      ink.style.width = cur.offsetWidth + 'px';
      ink.style.transform = 'translateX(' + cur.offsetLeft + 'px)';
    }
    function select(t, focus) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute('aria-selected', on ? 'true' : 'false');
        x.tabIndex = on ? 0 : -1;
        var p = document.getElementById(x.getAttribute('aria-controls'));
        p.hidden = !on; p.classList.toggle('is-on', on);
      });
      if (focus) t.focus();
      moveInk();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
      });
    });
    window.addEventListener('resize', moveInk);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInk);
    moveInk();
    return moveInk;
  }

  /* FAQ with smooth height */
  function initFaq() {
    $$('.faq details').forEach(function (d) {
      var s = d.querySelector('summary'), a = d.querySelector('.faq__a');
      s.addEventListener('click', function (e) {
        if (REDUCED || !a.animate) return;
        e.preventDefault();
        if (d.open) {
          var h = a.offsetHeight;
          a.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = function () { d.open = false; };
        } else {
          d.open = true;
          var hh = a.offsetHeight;
          a.animate([{ height: '0px', opacity: 0 }, { height: hh + 'px', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
        }
      });
    });
  }

  /* Form */
  var THANKS = [{ w: 'Рахмат!', l: 'ky' }, { w: 'Спасибо!', l: 'ru' }, { w: 'Thank you!', l: 'en' }, { w: 'Danke!', l: 'de' }, { w: '감사합니다!', l: 'ko' }, { w: '谢谢!', l: 'zh' }, { w: 'Merci!', l: 'fr' }];
  function initForm() {
    var form = $('#form'), ok = $('#formOk'), timer = 0;
    var F = { name: $('#fName'), phone: $('#fPhone'), consent: $('#fConsent') };
    function setErr(n, key) {
      var s = form.querySelector('[data-err="' + n + '"]');
      s.setAttribute('data-key', key || ''); s.textContent = key ? I.t(key) : '';
      var f = s.closest('.field'); if (f) f.classList.toggle('is-bad', !!key);
      F[n].setAttribute('aria-invalid', key ? 'true' : 'false');
      if (key) { s.id = 'err-' + n; F[n].setAttribute('aria-describedby', s.id); }
    }
    function validate() {
      var bad = null;
      function c(cond, n, k) { setErr(n, cond ? '' : k); if (!cond && !bad) bad = F[n]; }
      c(F.name.value.trim().length >= 2, 'name', 'fm.err.name');
      c(F.phone.value.replace(/\D/g, '').length >= 9, 'phone', 'fm.err.phone');
      c(F.consent.checked, 'consent', 'fm.err.consent');
      return bad;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = validate(); if (bad) { bad.focus(); return; }
      ok.hidden = false; ok.focus({ preventScroll: true });
      var k = 0; renderWord($('#okWord'), THANKS[0], true);
      clearInterval(timer);
      if (!REDUCED) timer = setInterval(function () { k = (k + 1) % THANKS.length; swapWord($('#okWord'), THANKS[k]); }, 1800);
    });
    ['name', 'phone'].forEach(function (n) { F[n].addEventListener('input', function () { if (F[n].getAttribute('aria-invalid') === 'true') validate(); }); });
    F.consent.addEventListener('change', function () { if (F.consent.checked) setErr('consent', ''); });
    $('#formAgain').addEventListener('click', function () { clearInterval(timer); form.reset(); ok.hidden = true; F.name.focus(); });
  }
  function retranslateErrors() { $$('[data-err]').forEach(function (s) { var k = s.getAttribute('data-key'); s.textContent = k ? I.t(k) : ''; }); }

  /* Header, menu, current section, mobile CTA bar */
  function initChrome() {
    var header = $('#header'), burger = $('.burger'), menu = $('#menu'), mbar = $('#mbar');
    function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 10); }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    function setMenu(open) {
      menu.hidden = !open;
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('data-i18n-attr', 'aria-label:' + (open ? 'a11y.close' : 'a11y.menu'));
      burger.setAttribute('aria-label', I.t(open ? 'a11y.close' : 'a11y.menu'));
      document.body.classList.toggle('menu-open', open);
    }
    burger.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 1120 && !menu.hidden) setMenu(false); });

    if (!('IntersectionObserver' in window)) return;
    var links = $$('.nav a');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'languages', 'formats', 'prices', 'teachers', 'reviews', 'faq', 'contact'].forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });

    var heroIn = true, signupIn = false;
    function upd() { mbar.classList.toggle('is-on', !heroIn && !signupIn); }
    new IntersectionObserver(function (e) { heroIn = e[0].isIntersecting; upd(); }).observe($('.hero__ctas'));
    new IntersectionObserver(function (e) { signupIn = e[0].isIntersecting; upd(); }, { threshold: 0.15 }).observe($('#signup'));
  }

  /* Boot */
  initHero();
  buildMarquee();
  renderGroups();
  initReveal();
  initCounters();
  var moveInk = initTabs();
  initFaq();
  initForm();
  initChrome();

  I.onChange(function () {
    renderWord($('#heroWord'), G[gi], !REDUCED);
    setCard(false);
    buildMarquee();
    renderGroups();
    reformatCounters();
    retranslateErrors();
    setTimeout(moveInk, 30);
  });
})();
