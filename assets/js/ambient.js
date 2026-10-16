/* Maison Babel — ambient motion layer.
   Keeps the page quietly alive: drifting glyphs that morph between scripts, pointer parallax,
   tilt + displacement on cards, letter-roll hovers, ink-wipe reveals, page tone shifts and
   sections sliding over each other. Everything is skipped under prefers-reduced-motion. */
(function () {
  'use strict';

  var gsap = window.gsap, ST = window.ScrollTrigger, I = window.I18N, L = window.LEXICON;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var SMALL = window.matchMedia('(max-width: 767px)').matches;
  if (REDUCED || !gsap || !ST || !L) return;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ---------------------------------------------------------------
     1. Glyph fields — faint letters of many scripts, drifting & morphing
     --------------------------------------------------------------- */
  var SCRIPTS = [
    { l: 'en', c: 'AaBbÉeGgRrSsΩ' }, { l: 'ru', c: 'АБДЖЗЛФЦЩЯёжщ' }, { l: 'ko', c: '가나말글한빛' },
    { l: 'ja', c: 'あいうことば花' }, { l: 'zh', c: '文字言语心月' }, { l: 'ar', c: 'عربكلم' }, { l: 'ky', c: 'ҢӨҮңөү' }
  ];
  function glyph() { var s = pick(SCRIPTS); return { ch: pick(Array.from(s.c)), l: s.l }; }

  function GlyphField(host, n, tone) {
    var box = document.createElement('div');
    box.className = 'glyphs glyphs--' + tone;
    box.setAttribute('aria-hidden', 'true');
    host.insertBefore(box, host.firstChild);
    var spans = [], tweens = [];
    for (var i = 0; i < n; i++) {
      var g = glyph(), sp = document.createElement('span');
      sp.textContent = g.ch; sp.setAttribute('lang', g.l);
      // spread evenly on a jittered grid so letters never clump
      var col = i % 4, row = Math.floor(i / 4), rows = Math.ceil(n / 4);
      sp.style.left = (col * 25 + rnd(3, 20)) + '%';
      sp.style.top = (row * (100 / rows) + rnd(2, 100 / rows - 8)) + '%';
      sp.style.fontSize = rnd(1.4, SMALL ? 3.6 : 6.2).toFixed(2) + 'rem';
      sp.style.setProperty('--o', (tone === 'dark' ? rnd(0.05, 0.11) : rnd(0.035, 0.085)).toFixed(3));
      box.appendChild(sp); spans.push(sp);
      tweens.push(gsap.to(sp, {
        x: rnd(-40, 40), y: rnd(-60, 60), rotate: rnd(-8, 8),
        duration: rnd(9, 18), ease: 'sine.inOut', repeat: -1, yoyo: true, delay: -rnd(0, 10)
      }));
    }
    var timer = 0, on = false;
    function morph() {
      var sp = pick(spans), g = glyph();
      sp.classList.add('is-morph');
      setTimeout(function () { sp.textContent = g.ch; sp.setAttribute('lang', g.l); sp.classList.remove('is-morph'); }, 900);
    }
    function set(v) {
      if (v === on) return; on = v;
      tweens.forEach(function (t) { v ? t.resume() : t.pause(); });
      clearInterval(timer);
      if (v) timer = setInterval(morph, 1400);
    }
    tweens.forEach(function (t) { t.pause(); });
    new IntersectionObserver(function (es) { set(es[0].isIntersecting); }).observe(host);
    this.box = box;
  }

  var heroField = null;
  [['.hero__bg', SMALL ? 8 : 14, 'light'], ['#method', SMALL ? 6 : 10, 'light'], ['#results', SMALL ? 6 : 12, 'dark'],
   ['#voices', SMALL ? 4 : 8, 'light'], ['#contact', SMALL ? 6 : 12, 'dark']].forEach(function (d) {
    var host = $(d[0]); if (!host) return;
    var f = new GlyphField(host, d[1], d[2]);
    if (d[0] === '.hero__bg') heroField = f;
  });

  /* ---------------------------------------------------------------
     2. Pointer parallax in the hero (uses the independent `translate`
        property so it composes with GSAP/CSS transforms)
     --------------------------------------------------------------- */
  if (FINE) {
    var layers = [
      { el: $('#astrolabe'), k: -16 }, { el: $('.glow--a'), k: 46 }, { el: $('.glow--b'), k: -38 },
      { el: $('.glow--c'), k: 26 }, { el: $('.hero__center'), k: 12 }, { el: heroField && heroField.box, k: -30 },
      { el: $('.hero__title'), k: 6 }
    ].filter(function (o) { return o.el; });
    var tx = 0, ty = 0, cx = 0, cy = 0, heroOn = true;
    new IntersectionObserver(function (es) { heroOn = es[0].isIntersecting; }).observe($('.hero'));
    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });
    gsap.ticker.add(function () {
      if (!heroOn) return;
      cx += (tx - cx) * 0.045; cy += (ty - cy) * 0.045;
      for (var i = 0; i < layers.length; i++) {
        layers[i].el.style.translate = (cx * layers[i].k).toFixed(2) + 'px ' + (cy * layers[i].k * 0.7).toFixed(2) + 'px';
      }
    });
  }

  /* ---------------------------------------------------------------
     3. Cards: slow 3D tilt, inner parallax, displacement on portraits
     --------------------------------------------------------------- */
  if (FINE) {
    $$('.fcard, .price, .wotd, .teacher').forEach(function (card) {
      var target = card.classList.contains('teacher') ? card.querySelector('.portrait') : card;
      if (!target) return;
      gsap.set(target, { transformPerspective: 1100 });
      var rx = gsap.quickTo(target, 'rotationX', { duration: 1.2, ease: 'power3.out' });
      var ry = gsap.quickTo(target, 'rotationY', { duration: 1.2, ease: 'power3.out' });
      var inner = card.querySelector('.fcard__art span, .portrait__glyph, .price__num, .wotd__word');
      var ix = inner ? gsap.quickTo(inner, 'x', { duration: 1.4, ease: 'power3.out' }) : null;
      var iy = inner ? gsap.quickTo(inner, 'y', { duration: 1.4, ease: 'power3.out' }) : null;
      var disp = card.querySelector('feDisplacementMap');
      var max = card.classList.contains('price') ? 2.5 : 4.5;
      card.addEventListener('pointermove', function (e) {
        var r = target.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        rx(-ny * max); ry(nx * max);
        if (ix) { ix(nx * 18); iy(ny * 12); }
      });
      card.addEventListener('pointerenter', function () { if (disp) gsap.to(disp, { attr: { scale: 12 }, duration: 1.8, ease: 'power2.out' }); });
      card.addEventListener('pointerleave', function () {
        rx(0); ry(0); if (ix) { ix(0); iy(0); }
        if (disp) gsap.to(disp, { attr: { scale: 0 }, duration: 1.4, ease: 'power3.out' });
      });
    });
    // the noise field under each portrait keeps slowly flowing while hovered
    $$('.portrait feTurbulence').forEach(function (t) {
      gsap.to(t, { attr: { baseFrequency: '0.008 0.013' }, duration: 7, ease: 'sine.inOut', repeat: -1, yoyo: true });
    });
  }

  /* ---------------------------------------------------------------
     4. Letter-roll hovers (staggered micro-interaction)
     --------------------------------------------------------------- */
  var ROLL = '.nav a, .header .btn .btn__label, .hero__ctas .btn__label, .price .btn__label, .link-u, .fcard__link > span:first-child, .langs__list .native:not([lang="ar"]), .menu__nav a > span, .footer__info .link-u';
  function roll(el) {
    if (!FINE || el.querySelector('.roll') || el.closest('#quizNext')) return;
    var txt = el.textContent; if (!txt.trim()) return;
    var chars = Array.from(txt), a = '', b = '';
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i] === ' ' ? '&nbsp;' : chars[i].replace(/[<>&]/g, '');
      a += '<i style="--i:' + i + '">' + c + '</i>';
      b += '<i style="--i:' + i + '">' + c + '</i>';
    }
    el.innerHTML = '<span class="roll"><span class="roll__a">' + a + '</span><span class="roll__b" aria-hidden="true">' + b + '</span></span>';
    if (!el.getAttribute('aria-label') && el.tagName !== 'SPAN') el.setAttribute('data-roll', '1');
  }
  function rollAll() { $$(ROLL).forEach(roll); }
  rollAll();
  if (I) I.onChange(function () { setTimeout(rollAll, 0); });

  /* ---------------------------------------------------------------
     5. Ink-wipe reveals for small text
     --------------------------------------------------------------- */
  $$('main .section .kicker, main .section .lead, .strip__caption, .principle p, .formats .kicker, .footer .kicker, .section .fine, .stat dd').forEach(function (el) {
    if (el.closest('.hero')) return;
    gsap.set(el, { clipPath: 'inset(0% 100% 0% 0%)', filter: 'blur(5px)', x: -12 });
    ST.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: function () {
        gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', filter: 'blur(0px)', x: 0, duration: 1.8, ease: 'power3.out', clearProps: 'clipPath,filter' });
      }
    });
  });

  /* ---------------------------------------------------------------
     6. Page tone shifts between sections + sections sliding over
     --------------------------------------------------------------- */
  var TONES = { method: '#f3efe8', strip: '#efebe4', languages: '#efebe4', formats: '#ece7de', teachers: '#f2eee7', test: '#ebe6dd', prices: '#f3efe8', voices: '#eee9e1', signup: '#f3efe8' };
  Object.keys(TONES).forEach(function (id) {
    var sec = document.getElementById(id); if (!sec) return;
    ST.create({
      trigger: sec, start: 'top 55%', end: 'bottom 55%',
      onToggle: function (self) { if (self.isActive) gsap.to(document.body, { backgroundColor: TONES[id], duration: 1.6, ease: 'power2.out', overwrite: 'auto' }); }
    });
  });
  ST.create({ trigger: '.hero', start: 'top top', end: 'bottom 55%', onEnterBack: function () { gsap.to(document.body, { backgroundColor: '#f3efe8', duration: 1.6, overwrite: 'auto' }); } });

  ['#results', '#contact'].forEach(function (sel) {
    var el = $(sel); if (!el) return;
    gsap.fromTo(el, { clipPath: 'inset(0% 3.5% 0% 3.5% round 36px 36px 0px 0px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)', ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 25%', scrub: 1 }
    });
    var inner = el.querySelector('.container');
    if (inner) gsap.fromTo(inner, { y: 80 }, { y: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 20%', scrub: 1 } });
  });

  // marquee and strip ease in from a slight scale as they arrive
  gsap.fromTo('.marquee__row', { scale: 0.96, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'top 40%', scrub: 1 } });

  window.addEventListener('load', function () { ST.refresh(); });
})();
