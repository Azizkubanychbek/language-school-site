/* Maison Babel — interactions & motion.
   Depends on: lexicon.js, i18n.js (required); GSAP + ScrollTrigger, Lenis, globe.js (optional —
   the page degrades gracefully to a static, fully readable layout without them). */
(function () {
  'use strict';

  var L = window.LEXICON;
  var I = window.I18N;
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var REDUCED = mqReduced.matches;
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var HAS_GSAP = !!(gsap && ST);
  var ANIM = HAS_GSAP && !REDUCED;
  var LOCALES = { ru: 'ru-RU', en: 'en-GB', ky: 'ky-KG' };
  var lenis = null;

  if (HAS_GSAP) gsap.registerPlugin(ST);
  if (!HAS_GSAP) root.classList.add('no-gsap');
  if (ANIM) root.classList.add('js-anim');
  else root.classList.add('no-loader');

  function rand(n) { return Math.floor(Math.random() * n); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function langName(code) { var n = L.LANG_NAMES[code]; return n ? (n[I.lang] || n.ru) : code; }
  function locale() { return LOCALES[I.lang] || 'ru-RU'; }
  function fmtNum(v, d) {
    try { return Number(v).toLocaleString(locale(), { minimumFractionDigits: d, maximumFractionDigits: d }); }
    catch (e) { return Number(v).toFixed(d); }
  }
  var refreshTimer;
  function refreshSoon() {
    if (!HAS_GSAP) return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function () { ST.refresh(); }, 120);
  }

  /* ------------------------------------------------------------------------
     Scrambler — typographic decode effect across writing systems
     ------------------------------------------------------------------------ */
  function Scrambler(el) { this.el = el; this.raf = 0; }
  Scrambler.prototype.to = function (text, lang, opts) {
    opts = opts || {};
    var el = this.el, self = this;
    cancelAnimationFrame(this.raf);
    el.setAttribute('lang', lang);
    el.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    if (REDUCED || opts.instant) { el.textContent = text; return Promise.resolve(); }
    var dur = opts.duration || 1150;
    var from = Array.from(el.textContent), to = Array.from(text);
    var pool = Array.from(L.POOLS[L.SCRIPT_OF[lang] || 'latin']);
    var n = Math.max(from.length, to.length), q = [], glyphs = [];
    for (var i = 0; i < n; i++) {
      var s = (i / n) * 0.38 + Math.random() * 0.14;
      q.push({ s: s, e: s + 0.22 + Math.random() * 0.26 });
    }
    var t0 = performance.now(), last = 0;
    return new Promise(function (resolve) {
      function frame(now) {
        var p = Math.min(1, (now - t0) / dur), swap = now - last > 60, html = '';
        if (swap) last = now;
        for (var k = 0; k < n; k++) {
          if (p >= q[k].e) html += esc(to[k] || '');
          else if (p >= q[k].s) {
            if (swap || !glyphs[k]) glyphs[k] = pool[rand(pool.length)];
            html += '<span class="g">' + glyphs[k] + '</span>';
          } else html += esc(from[k] || '');
        }
        el.innerHTML = html;
        if (p < 1) self.raf = requestAnimationFrame(frame);
        else { el.textContent = text; resolve(); }
      }
      self.raf = requestAnimationFrame(frame);
    });
  };

  /* ------------------------------------------------------------------------
     Split text (keeps inline markup such as <em>)
     ------------------------------------------------------------------------ */
  function splitInto(el, mode) {
    var frag = document.createDocumentFragment();
    function walk(node, parent) {
      for (var i = 0; i < node.childNodes.length; i++) {
        var ch = node.childNodes[i];
        if (ch.nodeType === 3) {
          var parts = ch.nodeValue.split(/([ \t\n\r]+)/);
          for (var j = 0; j < parts.length; j++) {
            var part = parts[j];
            if (!part) continue;
            if (/^[ \t\n\r]+$/.test(part)) { parent.appendChild(document.createTextNode(' ')); continue; }
            if (mode === 'rw') {
              var r = document.createElement('span'); r.className = 'rw'; r.textContent = part; parent.appendChild(r); continue;
            }
            var w = document.createElement('span'); w.className = 'sw';
            if (mode === 'chars') {
              var chars = Array.from(part);
              for (var k = 0; k < chars.length; k++) {
                var c = document.createElement('span'); c.className = 'sc'; c.textContent = chars[k]; w.appendChild(c);
              }
            } else {
              var wi = document.createElement('span'); wi.className = 'sc'; wi.textContent = part; w.appendChild(wi);
            }
            parent.appendChild(w);
          }
        } else if (ch.nodeType === 1) {
          if (ch.tagName === 'BR') { parent.appendChild(document.createElement('br')); continue; }
          var shell = ch.cloneNode(false);
          walk(ch, shell);
          parent.appendChild(shell);
        }
      }
    }
    var plain = el.textContent.replace(/\s+/g, ' ').trim();
    walk(el, frag);
    el.innerHTML = '';
    el.appendChild(frag);
    if (mode !== 'rw') {
      // Screen readers get the whole phrase, not letter-by-letter spans.
      el.setAttribute('aria-label', plain);
      Array.prototype.forEach.call(el.querySelectorAll('.sw'), function (w) { w.setAttribute('aria-hidden', 'true'); });
    }
  }

  /* ------------------------------------------------------------------------
     Teacher portraits — generated SVG (no photos)
     ------------------------------------------------------------------------ */
  function buildPortraits() {
    $$('.portrait').forEach(function (p) {
      var h = +p.getAttribute('data-hue') || 30, s = +p.getAttribute('data-seed') || 1;
      var id = 'pg' + s, tilt = ((s * 37) % 9) - 4;
      var long = s % 2 === 1;
      var svg =
        '<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<defs>' +
        '<linearGradient id="' + id + 'a" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="hsl(' + h + ',24%,82%)"/><stop offset="1" stop-color="hsl(' + h + ',20%,52%)"/></linearGradient>' +
        '<radialGradient id="' + id + 'b" cx="0.3" cy="0.2" r="0.8">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="' + id + 'c" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="hsl(' + h + ',18%,34%)" stop-opacity=".75"/><stop offset="1" stop-color="hsl(' + h + ',22%,20%)" stop-opacity=".95"/></linearGradient>' +
        '</defs>' +
        '<rect width="400" height="500" fill="url(#' + id + 'a)"/>' +
        '<g fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1">' +
        '<circle cx="200" cy="215" r="120"/><circle cx="200" cy="215" r="165" stroke-dasharray="2 6"/><circle cx="200" cy="215" r="210"/>' +
        '<path d="M0 215H400M200 0V500" stroke-opacity=".12"/></g>' +
        '<g transform="rotate(' + tilt + ' 200 420)">' +
        (long
          ? '<path d="M128 214 C 120 128, 280 128, 272 214 C 270 262, 292 318, 300 350 C 250 336, 150 336, 100 350 C 108 318, 130 262, 128 214 Z" fill="url(#' + id + 'c)" opacity=".5"/>'
          : '<path d="M138 196 C 140 126, 260 126, 262 196 C 248 162, 152 162, 138 196 Z" fill="url(#' + id + 'c)" opacity=".45"/>') +
        '<path d="M200 128 C 243 128 264 162 264 206 C 264 248 246 278 228 292 L 230 326 C 298 340 350 388 364 520 L 36 520 C 50 388 102 340 170 326 L 172 292 C 154 278 136 248 136 206 C 136 162 157 128 200 128 Z" fill="url(#' + id + 'c)" opacity=".5"/>' +
        '<path d="M200 128 C 243 128 264 162 264 206 C 264 248 246 278 228 292 L 230 326 C 298 340 350 388 364 520 M36 520 C 50 388 102 340 170 326 L 172 292 C 154 278 136 248 136 206 C 136 162 157 128 200 128" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>' +
        '</g>' +
        '<rect width="400" height="500" fill="url(#' + id + 'b)"/>' +
        '</svg>';
      p.innerHTML = svg + '<span class="portrait__glyph" lang="' + (p.getAttribute('data-glyph-lang') || '') + '">' + esc(p.getAttribute('data-glyph') || '') + '</span>';
    });
  }

  /* ------------------------------------------------------------------------
     Astrolabe ticks
     ------------------------------------------------------------------------ */
  function buildTicks() {
    var g = $('#astroTicks'); if (!g) return;
    var out = '';
    for (var i = 0; i < 120; i++) {
      var a = (i / 120) * Math.PI * 2, major = i % 10 === 0;
      var r1 = 480, r2 = major ? 456 : 470;
      out += '<line class="a-tick' + (major ? ' major' : '') + '" x1="' + (Math.cos(a) * r1).toFixed(1) + '" y1="' + (Math.sin(a) * r1).toFixed(1) +
        '" x2="' + (Math.cos(a) * r2).toFixed(1) + '" y2="' + (Math.sin(a) * r2).toFixed(1) + '"/>';
    }
    g.innerHTML = out;
  }

  /* ------------------------------------------------------------------------
     Marquee of greetings + tooltip
     ------------------------------------------------------------------------ */
  function buildMarquee() {
    var G = L.GREETINGS;
    function row(order, focusable) {
      var html = '';
      for (var k = 0; k < order.length; k++) {
        var i = order[k], g = G[i];
        html += '<span class="marquee__item"><span data-tip-i="' + i + '" lang="' + g.l + '"' + (g.l === 'ar' ? ' dir="rtl"' : '') +
          (focusable ? ' tabindex="0"' : '') + '>' + esc(g.w) + '</span></span>';
      }
      return html;
    }
    var a = G.map(function (_, i) { return i; });
    var b = a.slice().reverse();
    b.push(b.shift());
    var A = $('#marqueeA'), B = $('#marqueeB');
    // Two identical halves for a seamless loop; the copy is hidden from AT.
    if (A) A.innerHTML = '<span class="marquee__half">' + row(a, true) + row(a, false) + '</span><span class="marquee__half" aria-hidden="true">' + row(a, false) + row(a, false) + '</span>';
    if (B) B.innerHTML = '<span class="marquee__half" aria-hidden="true">' + row(b, false) + row(b, false) + '</span><span class="marquee__half" aria-hidden="true">' + row(b, false) + row(b, false) + '</span>';

    if (ANIM) {
      $$('.marquee__row').forEach(function (r) {
        var track = r.querySelector('.marquee__track');
        var dir = +r.getAttribute('data-dir') || -1;
        var tw = gsap.fromTo(track, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, duration: 90, ease: 'none', repeat: -1 });
        r._tw = tw;
        r.addEventListener('mouseenter', function () { gsap.to(tw, { timeScale: 0.15, duration: 1.2, ease: 'power2.out' }); });
        r.addEventListener('mouseleave', function () { gsap.to(tw, { timeScale: 1, duration: 1.2, ease: 'power2.out' }); });
      });
      ST.create({
        trigger: '.marquee', start: 'top bottom', end: 'bottom top',
        onUpdate: function (self) {
          var v = clamp(Math.abs(self.getVelocity()) / 300, 0, 6);
          $$('.marquee__row').forEach(function (r) {
            if (!r._tw || r.matches(':hover')) return;
            gsap.to(r._tw, { timeScale: 1 + v, duration: 0.4, overwrite: true, onComplete: function () { gsap.to(r._tw, { timeScale: 1, duration: 1.6, ease: 'power2.out' }); } });
          });
        }
      });
    }
  }

  var tip = $('#tip'), tipFor = null;
  function showTip(el) {
    var i = +el.getAttribute('data-tip-i'), g = L.GREETINGS[i];
    if (!g || !tip) return;
    tipFor = el;
    tip.innerHTML = '<span class="tip__w" lang="' + g.l + '"' + (g.l === 'ar' ? ' dir="rtl"' : '') + '>' + esc(g.w) + '</span>' +
      '<span class="tip__tr">[' + esc(g.tr) + ']</span>' +
      '<span class="tip__l">' + esc(langName(g.l)) + ' · ' + esc(I.t('tip.greeting')) + '</span>';
    var r = el.getBoundingClientRect();
    var x = clamp(r.left + r.width / 2, 150, window.innerWidth - 150);
    tip.style.left = x + 'px';
    tip.style.top = Math.max(r.top, 120) + 'px';
    tip.classList.add('is-on');
  }
  function hideTip() { tipFor = null; if (tip) tip.classList.remove('is-on'); }
  function bindTips() {
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest && e.target.closest('[data-tip-i]');
      if (t && e.pointerType !== 'touch') showTip(t);
    });
    document.addEventListener('pointerout', function (e) {
      var t = e.target.closest && e.target.closest('[data-tip-i]');
      if (t && (!e.relatedTarget || !t.contains(e.relatedTarget))) hideTip();
    });
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-tip-i]');
      if (t) { if (tipFor === t) hideTip(); else showTip(t); }
      else hideTip();
    });
    document.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches('[data-tip-i]')) showTip(e.target); });
    document.addEventListener('focusout', function (e) { if (e.target.matches && e.target.matches('[data-tip-i]')) hideTip(); });
    window.addEventListener('scroll', function () { if (tipFor) hideTip(); }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     Hero greeting cycle
     ------------------------------------------------------------------------ */
  var heroWord = $('#heroWord'), heroCap = $('#heroCaption');
  var heroScr = heroWord ? new Scrambler(heroWord) : null;
  var heroIdx = 0, heroTimer = 0, heroVisible = true;
  function greetingIndexFor(lang) {
    for (var i = 0; i < L.GREETINGS.length; i++) if (L.GREETINGS[i].l === lang) return i;
    return 0;
  }
  function setCaption(i) {
    if (!heroCap) return;
    var g = L.GREETINGS[i];
    var html = '<span class="hero__caption-lang">' + esc(langName(g.l)) + '</span><span class="hero__caption-tr">[' + esc(g.tr) + ']</span>';
    if (ANIM) {
      gsap.to(heroCap, { autoAlpha: 0, y: -6, duration: 0.35, ease: 'power2.in', onComplete: function () {
        heroCap.innerHTML = html;
        gsap.fromTo(heroCap, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out' });
      } });
    } else heroCap.innerHTML = html;
  }
  function heroGo(i, instant) {
    if (!heroScr) return;
    heroIdx = (i + L.GREETINGS.length) % L.GREETINGS.length;
    var g = L.GREETINGS[heroIdx];
    heroWord.setAttribute('data-tip-i', heroIdx);
    setCaption(heroIdx);
    return heroScr.to(g.w, g.l, { instant: instant });
  }
  function heroLoop() {
    clearTimeout(heroTimer);
    heroTimer = setTimeout(function () {
      if (heroVisible && !document.hidden) heroGo(heroIdx + 1);
      heroLoop();
    }, REDUCED ? 4200 : 2900);
  }
  function initHero() {
    if (!heroWord) return;
    heroGo(greetingIndexFor(I.lang), true);
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; }).observe($('.hero'));
    }
  }

  /* ------------------------------------------------------------------------
     Headline reveals
     ------------------------------------------------------------------------ */
  function revealChars(el, quick) {
    var cs = el.querySelectorAll('.sc');
    if (!ANIM) return;
    gsap.fromTo(cs, { yPercent: 115, rotate: 4 }, {
      yPercent: 0, rotate: 0, duration: quick ? 0.9 : 1.5, ease: 'expo.out',
      stagger: { each: quick ? 0.008 : 0.022 }
    });
  }
  function setupSplit(el) {
    var mode = el.getAttribute('data-split') || 'chars';
    splitInto(el, mode);
    if (!ANIM) return;
    if (el._revealed) { revealChars(el, true); return; }
    gsap.set(el.querySelectorAll('.sc'), { yPercent: 115 });
    if (el.closest('.hero') || el._st) return;
    el._st = ST.create({
      trigger: el, start: 'top 86%', once: true,
      onEnter: function () { el._revealed = true; revealChars(el); }
    });
  }

  function paintWords(el, progress) {
    var ws = el.querySelectorAll('.rw'), n = Math.round(progress * ws.length);
    for (var i = 0; i < ws.length; i++) {
      var on = i < n;
      if (ws[i]._on !== on) { ws[i]._on = on; ws[i].style.color = on ? 'rgba(20,26,38,1)' : 'rgba(20,26,38,0.18)'; }
    }
  }
  function setupWordScrub(el) {
    splitInto(el, 'rw');
    if (!ANIM) return;
    if (el._st) { paintWords(el, el._st.progress); return; }
    el._st = ST.create({
      trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: true,
      onUpdate: function (self) { paintWords(el, self.progress); }
    });
  }

  /* ------------------------------------------------------------------------
     Alphabet strip
     ------------------------------------------------------------------------ */
  var stripStage = -1;
  function buildStrip() {
    var cells = $('#stripCells'), steps = $('#stripSteps');
    if (!cells) return;
    var html = '';
    var first = Array.from(L.STRIP[0].chars);
    for (var i = 0; i < 12; i++) html += '<div class="strip__cell" data-i="' + String(i + 1).padStart(2, '0') + '"><span lang="en">' + first[i] + '</span></div>';
    cells.innerHTML = html;
    if (steps) steps.innerHTML = L.STRIP.map(function (_, i) { return '<i' + (i === 0 ? ' class="on"' : '') + '></i>'; }).join('');
    setStripStage(0, true);

    if (ANIM) {
      ST.create({
        trigger: '#strip', start: 'top 85%', end: 'bottom 15%',
        onUpdate: function (self) { setStripStage(clamp(Math.floor(self.progress * L.STRIP.length), 0, L.STRIP.length - 1)); }
      });
    } else if (!REDUCED) {
      var k = 0;
      setInterval(function () { k = (k + 1) % L.STRIP.length; setStripStage(k); }, 2600);
    }
  }
  function setStripStage(stage, instant) {
    if (stage === stripStage) return;
    stripStage = stage;
    var st = L.STRIP[stage], chars = Array.from(st.chars);
    var label = $('#stripLabel');
    if (label) { label.setAttribute('data-i18n', st.key); label.textContent = I.t(st.key); }
    $$('#stripSteps i').forEach(function (d, i) { d.classList.toggle('on', i === stage); });
    $$('.strip__cell span').forEach(function (s, i) {
      if (instant || REDUCED) { s.textContent = chars[i]; s.setAttribute('lang', st.l); return; }
      setTimeout(function () {
        s.classList.add('out');
        setTimeout(function () {
          s.textContent = chars[i]; s.setAttribute('lang', st.l);
          s.classList.remove('out'); s.classList.add('pre');
          void s.offsetWidth;
          s.classList.remove('pre');
        }, 320);
      }, i * 45);
    });
  }

  /* ------------------------------------------------------------------------
     Globe
     ------------------------------------------------------------------------ */
  var globe = null;
  function initGlobe() {
    var c = $('#globe');
    if (!c || !window.Globe) return;
    try {
      globe = new window.Globe(c, { cities: L.CITIES, home: L.HOME, homeLabel: I.t('lang.home'), reduced: REDUCED });
    } catch (e) { return; }
    if (ANIM) {
      ST.create({
        trigger: '#languages', start: 'top 75%', end: 'bottom 70%',
        onUpdate: function (self) { globe.setProgress(self.progress); }
      });
    } else globe.setProgress(1);

    $$('#langsList li').forEach(function (li) {
      var code = li.getAttribute('data-code');
      function on() { $$('#langsList li').forEach(function (x) { x.classList.toggle('is-active', x === li); }); globe.setActive(code); }
      function off() { li.classList.remove('is-active'); globe.setActive(null); }
      li.addEventListener('mouseenter', on);
      li.addEventListener('mouseleave', off);
      li.addEventListener('focus', on);
      li.addEventListener('blur', off);
      li.addEventListener('click', on);
    });
  }

  /* ------------------------------------------------------------------------
     Word of the day
     ------------------------------------------------------------------------ */
  var wotdIdx = 0, wotdScr = null;
  function dayOfYear(d) { var s = new Date(d.getFullYear(), 0, 0); return Math.floor((d - s) / 864e5); }
  function renderWotd(animate) {
    var w = L.WORDS[wotdIdx], card = $('.wotd');
    if (!w || !card) return;
    var meaning = $('#wotdMeaning'), meta = [$('#wotdTr'), $('#wotdPos'), $('#wotdLang')];
    function fill() {
      $('#wotdTr').textContent = '[' + w.tr + ']';
      $('#wotdPos').textContent = w.pos[I.lang] || w.pos.ru;
      $('#wotdLang').textContent = langName(w.l);
      meaning.textContent = w.m[I.lang] || w.m.ru;
      $('#wotdIdx').textContent = String(wotdIdx + 1).padStart(2, '0') + ' / ' + String(L.WORDS.length).padStart(2, '0');
      try { $('#wotdDate').textContent = new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()); }
      catch (e) { $('#wotdDate').textContent = new Date().toLocaleDateString(); }
    }
    meaning.classList.add('wotd__swap'); meta.forEach(function (m) { m.classList.add('wotd__swap'); });
    if (animate && !REDUCED) {
      card.classList.add('is-swapping');
      wotdScr.to(w.w, w.l, { duration: 900 });
      setTimeout(function () { fill(); card.classList.remove('is-swapping'); }, 420);
    } else {
      wotdScr.to(w.w, w.l, { instant: true });
      fill();
    }
  }
  function initWotd() {
    var el = $('#wotdWord'); if (!el) return;
    wotdScr = new Scrambler(el);
    wotdIdx = dayOfYear(new Date()) % L.WORDS.length;
    renderWotd(false);
    $('#wotdPrev').addEventListener('click', function () { wotdIdx = (wotdIdx - 1 + L.WORDS.length) % L.WORDS.length; renderWotd(true); });
    $('#wotdNext').addEventListener('click', function () { wotdIdx = (wotdIdx + 1) % L.WORDS.length; renderWotd(true); });
  }

  /* ------------------------------------------------------------------------
     Level quiz
     ------------------------------------------------------------------------ */
  var QUIZ = [
    { q: 'She ___ to Paris last year.', o: ['go', 'went', 'has gone', 'was go'], a: 1 },
    { q: 'If I ___ more time, I would travel the world.', o: ['have', 'will have', 'had', 'would have'], a: 2 },
    { q: 'By the time we arrived, the film ___.', o: ['already started', 'has already started', 'had already started', 'was already start'], a: 2 }
  ];
  var qz = { i: 0, score: 0, answered: null, done: false };
  function qzRender() {
    var item = QUIZ[qz.i];
    $('#quizNum').textContent = qz.i + 1;
    $('#quizBar').style.width = ((qz.i + 1) / QUIZ.length * 100) + '%';
    $('#quizQuestion').innerHTML = esc(item.q).replace('___', '<span class="gap" aria-label="blank"></span>');
    var opts = $('#quizOptions');
    opts.innerHTML = item.o.map(function (o, k) {
      return '<button type="button" class="quiz__opt" lang="en" data-k="' + k + '"><i>' + 'abcd'[k] + '</i><span>' + esc(o) + '</span></button>';
    }).join('');
    $('#quizFeedback').textContent = '';
    $('#quizFeedback').className = 'quiz__feedback';
    var next = $('#quizNext');
    next.disabled = true;
    next.querySelector('.btn__label').setAttribute('data-i18n', qz.i === QUIZ.length - 1 ? 'quiz.finish' : 'quiz.next');
    next.querySelector('.btn__label').textContent = I.t(qz.i === QUIZ.length - 1 ? 'quiz.finish' : 'quiz.next');
    if (ANIM) gsap.fromTo(['#quizQuestion', '.quiz__opt'], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05 });
  }
  function qzFeedback() {
    var fb = $('#quizFeedback'), item = QUIZ[qz.i];
    if (qz.answered == null) { fb.textContent = ''; return; }
    var ok = qz.answered === item.a;
    fb.textContent = ok ? I.t('quiz.correct') : I.t('quiz.wrong') + ' ' + item.o[item.a];
    fb.className = 'quiz__feedback ' + (ok ? 'ok' : 'ko');
  }
  function qzResult() {
    var s = qz.score, lvl = s <= 1 ? 'A2' : s === 2 ? 'B1' : 'B2+';
    var key = s <= 1 ? 'quiz.res.a' : s === 2 ? 'quiz.res.b' : 'quiz.res.c';
    $('#quizLevel').textContent = lvl;
    $('#quizScore').textContent = I.format('quiz.score', { n: s });
    $('#quizText').textContent = I.t(key);
  }
  function initQuiz() {
    if (!$('#quiz')) return;
    qzRender();
    $('#quizOptions').addEventListener('click', function (e) {
      var b = e.target.closest('.quiz__opt');
      if (!b || qz.answered != null) return;
      var k = +b.getAttribute('data-k'), item = QUIZ[qz.i];
      qz.answered = k;
      if (k === item.a) qz.score++;
      $$('.quiz__opt').forEach(function (o, j) {
        o.disabled = true;
        if (j === item.a) o.classList.add('is-correct');
        else if (j === k) o.classList.add('is-wrong');
      });
      qzFeedback();
      var next = $('#quizNext'); next.disabled = false; next.focus({ preventScroll: true });
    });
    $('#quizNext').addEventListener('click', function () {
      if (qz.answered == null) return;
      qz.answered = null;
      if (qz.i < QUIZ.length - 1) { qz.i++; qzRender(); }
      else {
        qz.done = true;
        $('#quizStage').hidden = true;
        $('#quizResult').hidden = false;
        qzResult();
        if (ANIM) {
          var o = { v: 0 }, target = qz.score;
          gsap.fromTo('#quizLevel', { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, duration: 1.2, ease: 'expo.out' });
          gsap.to(o, { v: target, duration: 0.8, onUpdate: function () { $('#quizScore').textContent = I.format('quiz.score', { n: Math.round(o.v) }); } });
        }
        refreshSoon();
      }
    });
    $('#quizRestart').addEventListener('click', function () {
      qz = { i: 0, score: 0, answered: null, done: false };
      $('#quizResult').hidden = true;
      $('#quizStage').hidden = false;
      qzRender();
    });
  }

  /* ------------------------------------------------------------------------
     Counters
     ------------------------------------------------------------------------ */
  function initCounters() {
    $$('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count')), d = +(el.getAttribute('data-decimals') || 0);
      el.textContent = fmtNum(target, d);
      if (!ANIM) return;
      var o = { v: 0 };
      el.textContent = fmtNum(0, d);
      ST.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: function () {
          gsap.to(o, { v: target, duration: 2.4, ease: 'power3.out', onUpdate: function () { el.textContent = fmtNum(o.v, d); }, onComplete: function () { el._done = true; } });
        }
      });
    });
  }
  function reformatCounters() {
    $$('[data-count]').forEach(function (el) {
      if (ANIM && !el._done) return;
      el.textContent = fmtNum(parseFloat(el.getAttribute('data-count')), +(el.getAttribute('data-decimals') || 0));
    });
  }

  /* ------------------------------------------------------------------------
     Testimonials slider
     ------------------------------------------------------------------------ */
  function initVoices() {
    var items = $$('.voice'), dots = $$('#voDots i'), cur = 0, timer = 0, paused = false, visible = false;
    if (!items.length) return;
    function go(i) {
      cur = (i + items.length) % items.length;
      items.forEach(function (it, k) { it.classList.toggle('is-active', k === cur); it.setAttribute('aria-hidden', k === cur ? 'false' : 'true'); });
      dots.forEach(function (d, k) { d.classList.toggle('on', k === cur); });
    }
    function loop() { clearInterval(timer); if (REDUCED) return; timer = setInterval(function () { if (!paused && visible && !document.hidden) go(cur + 1); }, 7000); }
    $('#voPrev').addEventListener('click', function () { go(cur - 1); loop(); });
    $('#voNext').addEventListener('click', function () { go(cur + 1); loop(); });
    var sl = $('.voices__slider');
    sl.addEventListener('mouseenter', function () { paused = true; });
    sl.addEventListener('mouseleave', function () { paused = false; });
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(sl);
    go(0); loop();
  }

  /* ------------------------------------------------------------------------
     Form (front-end only)
     ------------------------------------------------------------------------ */
  var THANKS = [
    { w: 'Рахмат', l: 'ky' }, { w: 'Спасибо', l: 'ru' }, { w: 'Thank you', l: 'en' }, { w: 'Merci', l: 'fr' },
    { w: 'Danke', l: 'de' }, { w: 'Gracias', l: 'es' }, { w: 'ありがとう', l: 'ja' }, { w: '谢谢', l: 'zh' },
    { w: '감사합니다', l: 'ko' }, { w: 'Teşekkürler', l: 'tr' }, { w: 'شكرا', l: 'ar' }
  ];
  function initForm() {
    var form = $('#form'); if (!form) return;
    var ok = $('#formOk'), okScr = new Scrambler($('#formOkWord')), okTimer = 0;
    function setErr(name, key) {
      var span = form.querySelector('[data-err="' + name + '"]');
      if (!span) return;
      span.setAttribute('data-key', key || '');
      span.textContent = key ? I.t(key) : '';
      var field = span.closest('.field');
      if (field) field.classList.toggle('is-invalid', !!key);
      var input = field ? field.querySelector('input') : (name === 'consent' ? $('#fConsent') : null);
      if (input) input.setAttribute('aria-invalid', key ? 'true' : 'false');
      if (input && key) { span.id = span.id || 'err-' + name; input.setAttribute('aria-describedby', span.id); }
    }
    var F = { name: $('#fName'), phone: $('#fPhone'), email: $('#fEmail'), consent: $('#fConsent') };
    function validate() {
      var name = F.name.value.trim(), phone = F.phone.value.replace(/\D/g, ''), email = F.email.value.trim();
      var first = null;
      function check(cond, n, key, el) { setErr(n, cond ? '' : key); if (!cond && !first) first = el; }
      check(name.length >= 2, 'name', 'fm.err.name', F.name);
      check(phone.length >= 9, 'phone', 'fm.err.phone', F.phone);
      check(!email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), 'email', 'fm.err.email', F.email);
      check(F.consent.checked, 'consent', 'fm.err.consent', F.consent);
      return first;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = validate();
      if (bad) { bad.focus(); return; }
      ok.hidden = false;
      ok.focus({ preventScroll: true });
      var k = 0;
      okScr.to(THANKS[0].w, THANKS[0].l, { instant: true });
      clearInterval(okTimer);
      if (!REDUCED) okTimer = setInterval(function () { k = (k + 1) % THANKS.length; okScr.to(THANKS[k].w, THANKS[k].l, { duration: 900 }); }, 2200);
    });
    ['name', 'phone', 'email'].forEach(function (n) {
      F[n].addEventListener('input', function () { if (F[n].closest('.field').classList.contains('is-invalid')) validate(); });
    });
    F.consent.addEventListener('change', function () { if (F.consent.checked) setErr('consent', ''); });
    $('#formAgain').addEventListener('click', function () {
      clearInterval(okTimer);
      form.reset();
      ok.hidden = true;
      F.name.focus();
    });
  }
  function retranslateErrors() {
    $$('[data-err]').forEach(function (s) { var k = s.getAttribute('data-key'); s.textContent = k ? I.t(k) : ''; });
  }

  /* ------------------------------------------------------------------------
     Footer word in many scripts
     ------------------------------------------------------------------------ */
  function initFooterWord() {
    var el = $('#footerWord'); if (!el || REDUCED) return;
    var words = [{ w: 'Babel', l: 'en' }, { w: 'Бабель', l: 'ru' }, { w: '바벨', l: 'ko' }, { w: 'バベル', l: 'ja' }, { w: '巴别', l: 'zh' }, { w: 'بابل', l: 'ar' }, { w: 'Babil', l: 'tr' }];
    var scr = new Scrambler(el), i = 0, vis = false;
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(el);
    setInterval(function () { if (!vis || document.hidden) return; i = (i + 1) % words.length; scr.to(words[i].w, words[i].l, { duration: 1300 }); }, 3200);
  }

  /* ------------------------------------------------------------------------
     Header, nav, menu
     ------------------------------------------------------------------------ */
  function initHeader() {
    var header = $('#header'), lastY = 0, ticking = false;
    function update() {
      var y = window.scrollY || window.pageYOffset;
      header.classList.toggle('is-scrolled', y > 40);
      var menuOpen = document.body.classList.contains('menu-open');
      header.classList.toggle('is-hidden', !menuOpen && y > 400 && y > lastY + 2);
      if (y < lastY - 2 || y < 400) header.classList.remove('is-hidden');
      lastY = y; ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();

    // current section highlight
    var links = $$('.nav a');
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var id = e.target.id;
          links.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ['top', 'method', 'languages', 'formats', 'teachers', 'test', 'prices', 'contact'].forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
    }

    // mobile menu
    var burger = $('.burger'), menu = $('#menu');
    function setMenu(open) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('data-i18n-attr', 'aria-label:' + (open ? 'a11y.close' : 'a11y.menu'));
      burger.setAttribute('aria-label', I.t(open ? 'a11y.close' : 'a11y.menu'));
      document.body.classList.toggle('menu-open', open);
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(function () { menu.classList.add('is-open'); });
        if (lenis) lenis.stop();
        if (ANIM) gsap.fromTo('.menu__nav a', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: 'expo.out', stagger: 0.05, delay: 0.2 });
      } else {
        menu.classList.remove('is-open');
        setTimeout(function () { if (!document.body.classList.contains('menu-open')) menu.hidden = true; }, REDUCED ? 0 : 800);
        if (lenis) lenis.start();
      }
    }
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); burger.focus(); } });
  }

  function initAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = id === '#top' ? document.body : document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, { offset: id === '#top' ? 0 : -10, duration: 1.8 });
      else if (id === '#top') window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
      else target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  }

  /* ------------------------------------------------------------------------
     Cursor, magnetic buttons
     ------------------------------------------------------------------------ */
  function initCursor() {
    if (!FINE || REDUCED) return;
    root.classList.add('has-cursor');
    var cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), glyph = $('#cursorGlyph');
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      cur.classList.remove('is-hidden');
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cur.classList.add('is-hidden'); });
    (function tick() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0)';
      requestAnimationFrame(tick);
    })();
    var HOVER = 'a, button, [data-tip-i], .fcard, #langsList li, label.check, select';
    document.addEventListener('pointerover', function (e) { if (e.target.closest && e.target.closest(HOVER)) cur.classList.add('is-hover'); });
    document.addEventListener('pointerout', function (e) {
      var from = e.target.closest && e.target.closest(HOVER), to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(HOVER);
      if (from && !to) cur.classList.remove('is-hover');
    });
    // the glyph inside the ring follows the writing system of the current section
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var g = e.target.getAttribute('data-glyph');
          if (glyph.textContent === g) return;
          glyph.style.opacity = 0;
          setTimeout(function () { glyph.textContent = g; glyph.style.opacity = ''; }, 250);
        });
      }, { rootMargin: '-50% 0px -50% 0px' });
      $$('[data-glyph]').forEach(function (s) { io.observe(s); });
    }
  }

  function initMagnetic() {
    if (!FINE || !ANIM) return;
    $$('.magnetic').forEach(function (el) {
      var label = el.querySelector('.btn__label');
      var xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' }), yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' });
      var lx = label ? gsap.quickTo(label, 'x', { duration: 0.9, ease: 'power3.out' }) : null, ly = label ? gsap.quickTo(label, 'y', { duration: 0.9, ease: 'power3.out' }) : null;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * 0.28); yTo(dy * 0.38);
        if (lx) { lx(dx * 0.12); ly(dy * 0.16); }
      });
      el.addEventListener('pointerleave', function () { xTo(0); yTo(0); if (lx) { lx(0); ly(0); } });
    });
  }

  /* ------------------------------------------------------------------------
     Scroll-driven scenes (GSAP)
     ------------------------------------------------------------------------ */
  function initScenes() {
    if (!ANIM) return;
    // centre the astrolabe through GSAP so scale/rotate compose cleanly with it
    gsap.set('#astrolabe', { xPercent: -50, yPercent: -50, x: 0, y: 0 });
    var mm = gsap.matchMedia();

    // Hero: pinned full-screen scene on larger screens
    mm.add('(min-width: 768px)', function () {
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=130%', scrub: 1, pin: '.hero__pin', anticipatePin: 1 }
      });
      tl.to('.hero__center', { yPercent: -18, scale: 0.86, autoAlpha: 0, filter: 'blur(10px)', duration: 0.45 }, 0)
        .to('.hero__bottom', { y: -80, autoAlpha: 0, duration: 0.35 }, 0.02)
        .to(['.hero__top', '.scroll-cue'], { autoAlpha: 0, duration: 0.2 }, 0)
        .fromTo('#astrolabe', { scale: 1, rotate: 0 }, { scale: 1.85, rotate: 50, duration: 1 }, 0)
        .to('.hero__bg', { yPercent: 8, duration: 1 }, 0)
        .fromTo('.hero__statement', { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.4)
        .to('.hero__statement', { y: -40, duration: 0.25 }, 0.75);
      return function () { gsap.set(['.hero__center', '.hero__bottom', '.hero__top', '.scroll-cue', '#astrolabe', '.hero__statement'], { clearProps: 'all' }); };
    });
    mm.add('(max-width: 767px)', function () {
      gsap.to('#astrolabe', { rotate: 40, scale: 1.25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.to('.hero__center', { yPercent: -30, autoAlpha: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    });

    // Formats: horizontal scroll on desktop
    mm.add('(min-width: 961px)', function () {
      var section = $('#formats'), track = $('#fmtTrack');
      section.classList.add('is-hscroll');
      function dist() { return Math.max(0, track.scrollWidth - window.innerWidth); }
      var tw = gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: section, pin: '.formats__pin', start: 'top top', end: function () { return '+=' + dist(); },
          scrub: 1, invalidateOnRefresh: true,
          onUpdate: function (self) { gsap.set('#fmtBar', { scaleX: 0.2 + self.progress * 0.8 }); }
        }
      });
      $$('.fcard').forEach(function (card) {
        gsap.fromTo(card.querySelector('.fcard__art span'), { xPercent: 60 }, {
          xPercent: -20, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true }
        });
        gsap.fromTo(card.querySelector('.fcard__art svg'), { rotate: -25 }, {
          rotate: 25, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true }
        });
      });
      return function () { section.classList.remove('is-hscroll'); gsap.set(track, { clearProps: 'transform' }); };
    });

    // Ghost words drift
    $$('.ghost span').forEach(function (s, i) {
      var dir = i % 2 ? 1 : -1;
      gsap.fromTo(s, { xPercent: dir < 0 ? 0 : -25, yPercent: 0 }, {
        xPercent: dir < 0 ? -25 : 0, yPercent: 30, ease: 'none',
        scrollTrigger: { trigger: s.closest('section') || s.parentNode, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
      });
    });

    // Fade-ups, staggered by position among siblings
    $$('[data-fade]').forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.hasAttribute('data-fade'); });
      var delay = Math.max(0, sibs.indexOf(el)) * 0.12;
      ST.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter: function () { gsap.to(el, { autoAlpha: 1, y: 0, duration: 1.4, ease: 'expo.out', delay: delay, overwrite: true }); }
      });
    });

    // Line-drawn icons
    $$('.principle__icon').forEach(function (svg) {
      var parts = svg.querySelectorAll('circle, path');
      parts.forEach(function (p) { var len = p.getTotalLength ? Math.ceil(p.getTotalLength()) : 200; p.style.setProperty('--len', len); p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });
      ST.create({ trigger: svg, start: 'top 88%', once: true, onEnter: function () { gsap.to(parts, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', stagger: 0.12 }); } });
    });

    // Portraits: subtle inner parallax
    $$('.portrait svg').forEach(function (svg) {
      gsap.fromTo(svg, { yPercent: -4, scale: 1.1 }, { yPercent: 4, scale: 1.1, ease: 'none', scrollTrigger: { trigger: svg.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Footer wordmark rises
    gsap.fromTo('.footer__mark span', { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.footer__mark', start: 'top bottom', end: 'bottom 85%', scrub: 1 } });
  }

  /* ------------------------------------------------------------------------
     Smooth scroll (Lenis)
     ------------------------------------------------------------------------ */
  function initLenis() {
    if (REDUCED || !window.Lenis) return;
    try {
      lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 });
    } catch (e) { lenis = null; return; }
    if (HAS_GSAP) {
      lenis.on('scroll', ST.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    }
  }

  /* ------------------------------------------------------------------------
     Loader + intro
     ------------------------------------------------------------------------ */
  function intro() {
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo('#astrolabe', { autoAlpha: 0, scale: 0.82, rotate: -30 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 2.6, ease: 'power3.out' }, 0)
      .fromTo('.glow', { autoAlpha: 0 }, { autoAlpha: 1, duration: 2.4, stagger: 0.2, ease: 'power2.out' }, 0)
      .fromTo('.hero__word', { autoAlpha: 0, yPercent: 20, filter: 'blur(12px)' }, { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', duration: 1.8 }, 0.2)
      .fromTo('.hero__caption', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 0.8)
      .add(function () { var h = $('.hero__title'); h._revealed = true; revealChars(h); }, 0.35)
      .fromTo(['.hero__top', '.hero__lead', '.hero__ctas', '.scroll-cue', '.header'], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.08, clearProps: 'transform' }, 0.6);
    return tl;
  }

  function runLoader() {
    var loader = $('#loader');
    if (!ANIM || !loader) { startAfterIntro(); return; }
    loader.style.animation = 'none'; // JS is in control; remove the CSS safety timer
    if (lenis) lenis.stop();
    gsap.set(['.hero__top', '.hero__lead', '.hero__ctas', '.scroll-cue', '.header', '.hero__word', '.hero__caption', '#astrolabe', '.glow'], { autoAlpha: 0 });
    var word = $('#loaderWord'), count = $('#loaderCount'), k = 0, G = L.GREETINGS;
    var cyc = setInterval(function () { k = (k + 1) % G.length; word.textContent = G[k].w; word.setAttribute('lang', G[k].l); }, 150);
    var o = { v: 0 };
    var fontsReady = (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1500); })]) : Promise.resolve();
    var counting = new Promise(function (res) {
      gsap.to(o, { v: 100, duration: 1.7, ease: 'power2.inOut', onUpdate: function () {
        count.textContent = String(Math.round(o.v)).padStart(3, '0');
        gsap.set('#loaderBar', { scaleX: o.v / 100 });
      }, onComplete: res });
    });
    Promise.all([fontsReady, counting]).then(function () {
      clearInterval(cyc);
      var g = G[greetingIndexFor(I.lang)];
      word.textContent = g.w; word.setAttribute('lang', g.l);
      setTimeout(function () {
        loader.classList.add('is-done');
        intro();
        setTimeout(function () { loader.hidden = true; startAfterIntro(); }, 1100);
      }, 280);
    });
  }

  function startAfterIntro() {
    if (lenis) lenis.start();
    heroLoop();
    refreshSoon();
  }

  /* ------------------------------------------------------------------------
     Language change
     ------------------------------------------------------------------------ */
  function onLang(lang) {
    $$('[data-split]').forEach(setupSplit);
    $$('[data-reveal="words"]').forEach(setupWordScrub);
    if (globe) globe.setHomeLabel(I.t('lang.home'));
    reformatCounters();
    renderWotd(false);
    if ($('#quiz')) {
      if (qz.done) qzResult(); else qzFeedback();
    }
    retranslateErrors();
    hideTip();
    if (heroScr) { heroGo(greetingIndexFor(lang)); heroLoop(); }
    if (ANIM) gsap.fromTo('.lang-switch button[aria-pressed="true"]', { scale: 0.85 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
    refreshSoon();
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  function boot() {
    buildTicks();
    buildPortraits();
    buildMarquee();
    bindTips();
    buildStrip();
    initLenis();
    initHeader();
    initAnchors();
    $$('[data-split]').forEach(setupSplit);
    $$('[data-reveal="words"]').forEach(setupWordScrub);
    initHero();
    initGlobe();
    initWotd();
    initQuiz();
    initCounters();
    initVoices();
    initForm();
    initFooterWord();
    initCursor();
    initMagnetic();
    initScenes();
    I.onChange(onLang);
    runLoader();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshSoon);
    window.addEventListener('load', refreshSoon);
  }

  try { boot(); }
  catch (err) {
    // Never leave the page hidden behind the loader or invisible reveal states.
    root.classList.remove('js-anim');
    var ld = document.getElementById('loader'); if (ld) ld.hidden = true;
    if (window.console) console.error('[Maison Babel]', err);
  }
})();
