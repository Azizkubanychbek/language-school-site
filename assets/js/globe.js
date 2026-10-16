/* Maison Babel — line-drawn canvas globe.
   Orthographic projection, graticule + dotted sphere, great-circle arcs from
   Bishkek to the home city of every language. Progress (0..1) is driven by
   scroll from main.js; it rotates the globe and draws the arcs. */
(function () {
  'use strict';

  var D2R = Math.PI / 180;
  var FONT = '"Cormorant Garamond", "Noto Serif JP", "Noto Serif KR", "Noto Serif SC", "Noto Naskh Arabic", Georgia, serif';
  var C = {
    ink: '20,26,38',
    accent: '122,46,58',
    champagne: '216,196,160'
  };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  function toVec(lat, lon) {
    var p = lat * D2R, l = lon * D2R;
    return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)];
  }
  function toLatLon(v) {
    var r = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return { lat: Math.asin(v[2] / r) / D2R, lon: Math.atan2(v[1], v[0]) / D2R };
  }
  function slerp(a, b, t) {
    var d = clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1);
    var w = Math.acos(d);
    if (w < 1e-6) return a.slice();
    var s = Math.sin(w);
    var k1 = Math.sin((1 - t) * w) / s, k2 = Math.sin(t * w) / s;
    return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
  }

  function Globe(canvas, opts) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.cities = opts.cities;
    this.home = opts.home;
    this.homeLabel = opts.homeLabel || 'Bishkek';
    this.progress = 0;
    this.target = 0;
    this.active = null;
    this.reduced = !!opts.reduced;
    this.visible = false;
    this.t0 = performance.now();
    this.dots = this.makeDots(window.innerWidth < 700 ? 520 : 900);
    this.arcs = this.makeArcs();
    this.resize = this.resize.bind(this);
    this.frame = this.frame.bind(this);
    this.resize();
    var self = this;
    if (window.ResizeObserver) new ResizeObserver(this.resize).observe(canvas);
    else window.addEventListener('resize', this.resize);
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        self.visible = es[0].isIntersecting;
        if (self.visible) self.loop();
      }, { rootMargin: '100px' }).observe(canvas);
    } else { this.visible = true; this.loop(); }
  }

  Globe.prototype.makeDots = function (n) {
    var pts = [], g = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = g * i;
      pts.push(toLatLon([Math.cos(th) * r, Math.sin(th) * r, y]));
    }
    return pts;
  };

  Globe.prototype.makeArcs = function () {
    var h = toVec(this.home.lat, this.home.lon), arcs = [];
    for (var i = 0; i < this.cities.length; i++) {
      var c = this.cities[i], v = toVec(c.lat, c.lon), pts = [];
      var ang = Math.acos(clamp(h[0] * v[0] + h[1] * v[1] + h[2] * v[2], -1, 1));
      var lift = 0.06 + ang * 0.12;
      for (var s = 0; s <= 48; s++) {
        var t = s / 48, p = toLatLon(slerp(h, v, t));
        p.r = 1 + Math.sin(Math.PI * t) * lift;
        pts.push(p);
      }
      arcs.push(pts);
    }
    return arcs;
  };

  Globe.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = this.c.clientWidth || 600, h = this.c.clientHeight || w;
    this.dpr = dpr;
    this.c.width = Math.round(w * dpr);
    this.c.height = Math.round(h * dpr);
    this.w = this.c.width; this.h = this.c.height;
    this.R = Math.min(this.w, this.h) * 0.38;
    this.scale = clamp(Math.min(this.w, this.h) / dpr / 560, 0.7, 1.15);
    this.cx = this.w / 2; this.cy = this.h / 2;
    if (!this.running) this.draw(performance.now());
  };

  Globe.prototype.project = function (lat, lon, r) {
    var p = lat * D2R, dl = (lon - this.lon0) * D2R, p0 = this.lat0 * D2R;
    var cp = Math.cos(p), sp = Math.sin(p), cd = Math.cos(dl);
    var x = cp * Math.sin(dl);
    var y = Math.cos(p0) * sp - Math.sin(p0) * cp * cd;
    var z = Math.sin(p0) * sp + Math.cos(p0) * cp * cd;
    r = r || 1;
    var vis = z > 0 || (r > 1 && Math.sqrt(x * x + y * y) * r > 1);
    return { x: this.cx + x * r * this.R, y: this.cy - y * r * this.R, z: z, vis: vis };
  };

  Globe.prototype.setProgress = function (p) { this.target = clamp(p, 0, 1); if (!this.running) this.draw(performance.now()); };
  Globe.prototype.setActive = function (code) { this.active = code; if (!this.running) this.draw(performance.now()); };
  Globe.prototype.setHomeLabel = function (s) { this.homeLabel = s; if (!this.running) this.draw(performance.now()); };

  Globe.prototype.loop = function () {
    if (this.running || this.reduced) { if (this.reduced) this.draw(performance.now()); return; }
    this.running = true;
    requestAnimationFrame(this.frame);
  };
  Globe.prototype.frame = function (now) {
    if (!this.visible) { this.running = false; return; }
    this.draw(now);
    requestAnimationFrame(this.frame);
  };

  Globe.prototype.draw = function (now) {
    var ctx = this.ctx, dpr = this.dpr, R = this.R, i, j, p;
    var t = (now - this.t0) / 1000;
    if (this.reduced) this.progress = 1; else this.progress += (this.target - this.progress) * 0.08;
    var pr = this.progress;
    this.lon0 = 30 + pr * 54 + (this.reduced ? 0 : Math.sin(t * 0.12) * 3);
    this.lat0 = 46 - pr * 6;

    ctx.clearRect(0, 0, this.w, this.h);

    // Soft light behind the sphere
    var g = ctx.createRadialGradient(this.cx - R * 0.35, this.cy - R * 0.4, R * 0.1, this.cx, this.cy, R * 1.25);
    g.addColorStop(0, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.6, 'rgba(' + C.champagne + ',0.16)');
    g.addColorStop(1, 'rgba(' + C.champagne + ',0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(this.cx, this.cy, R * 1.25, 0, Math.PI * 2); ctx.fill();

    // Outline + outer technical rings
    ctx.lineWidth = 1 * dpr;
    ctx.strokeStyle = 'rgba(' + C.ink + ',0.35)';
    ctx.beginPath(); ctx.arc(this.cx, this.cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(' + C.ink + ',0.10)';
    ctx.setLineDash([2 * dpr, 6 * dpr]);
    ctx.beginPath(); ctx.arc(this.cx, this.cy, R * 1.16, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    // degree ticks on outer ring, rotating with longitude
    for (i = 0; i < 72; i++) {
      var a = (i * 5 - this.lon0) * D2R, len = i % 6 === 0 ? 10 : 4;
      ctx.strokeStyle = 'rgba(' + C.ink + ',' + (i % 6 === 0 ? 0.32 : 0.14) + ')';
      ctx.beginPath();
      ctx.moveTo(this.cx + Math.cos(a) * R * 1.22, this.cy + Math.sin(a) * R * 1.22);
      ctx.lineTo(this.cx + Math.cos(a) * (R * 1.22 + len * dpr), this.cy + Math.sin(a) * (R * 1.22 + len * dpr));
      ctx.stroke();
    }

    // Graticule
    var self = this;
    function line(getPt, steps, alphaFront, alphaBack) {
      var prev = null;
      for (var s = 0; s <= steps; s++) {
        var q = getPt(s / steps), pp = self.project(q[0], q[1], 1);
        if (prev) {
          ctx.strokeStyle = 'rgba(' + C.ink + ',' + (pp.z > 0 && prev.z > 0 ? alphaFront : alphaBack) + ')';
          ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(pp.x, pp.y); ctx.stroke();
        }
        prev = pp;
      }
    }
    ctx.lineWidth = 0.8 * dpr;
    for (i = -60; i <= 60; i += 30) (function (lat) { line(function (u) { return [lat, -180 + u * 360]; }, 90, 0.16, 0.035); })(i);
    for (i = 0; i < 180; i += 20) (function (lon) { line(function (u) { return [-90 + u * 180, lon]; }, 60, 0.13, 0.03); })(i);
    for (i = 180; i < 360; i += 20) (function (lon) { line(function (u) { return [-90 + u * 180, lon]; }, 60, 0.13, 0.03); })(i);

    // Dots
    for (i = 0; i < this.dots.length; i++) {
      p = this.project(this.dots[i].lat, this.dots[i].lon, 1);
      if (p.z <= 0) continue;
      ctx.fillStyle = 'rgba(' + C.ink + ',' + (0.08 + p.z * 0.28) + ')';
      ctx.fillRect(p.x - 0.7 * dpr, p.y - 0.7 * dpr, 1.4 * dpr, 1.4 * dpr);
    }

    // Arcs
    var hp = this.project(this.home.lat, this.home.lon, 1);
    ctx.font = '400 ' + Math.round(15 * dpr) + 'px ' + FONT;
    ctx.textBaseline = 'middle';
    for (i = 0; i < this.arcs.length; i++) {
      var arc = this.arcs[i], city = this.cities[i];
      var isActive = this.active === city.code;
      var ap = this.reduced ? 1 : ease(clamp((pr * 1.35 - i * 0.045) / 0.45, 0, 1));
      if (ap <= 0) continue;
      var n = Math.max(1, Math.floor(ap * (arc.length - 1)));
      ctx.lineWidth = (isActive ? 1.8 : 1) * dpr;
      var last = null;
      for (j = 1; j <= n; j++) {
        var a0 = this.project(arc[j - 1].lat, arc[j - 1].lon, arc[j - 1].r);
        var a1 = this.project(arc[j].lat, arc[j].lon, arc[j].r);
        var alpha = (a0.vis && a1.vis) ? (isActive ? 0.95 : 0.6) : 0.08;
        ctx.strokeStyle = 'rgba(' + C.accent + ',' + alpha + ')';
        ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke();
        last = a1;
      }
      if (last && ap < 1 && last.vis) {
        ctx.fillStyle = 'rgba(' + C.accent + ',0.9)';
        ctx.beginPath(); ctx.arc(last.x, last.y, 2.2 * dpr, 0, Math.PI * 2); ctx.fill();
      }
      if (ap >= 1) {
        var cp = this.project(city.lat, city.lon, 1);
        if (cp.z > 0) {
          var pulse = this.reduced ? 0 : (Math.sin(t * 2 + i) + 1) / 2;
          ctx.fillStyle = 'rgba(' + C.ink + ',0.9)';
          ctx.beginPath(); ctx.arc(cp.x, cp.y, (isActive ? 3.4 : 2.4) * dpr, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = 'rgba(' + C.accent + ',' + (isActive ? 0.6 : 0.18 + pulse * 0.12) + ')';
          ctx.lineWidth = 1 * dpr;
          ctx.beginPath(); ctx.arc(cp.x, cp.y, (isActive ? 10 + pulse * 4 : 6 + pulse * 2) * dpr, 0, Math.PI * 2); ctx.stroke();
          // label on a short leader line, at a per-city angle so clustered cities never collide
          var ang = (city.a != null ? city.a : -45) * D2R, dist = (city.d || 24) * dpr * this.scale;
          var ex = cp.x + Math.cos(ang) * dist, ey = cp.y + Math.sin(ang) * dist;
          var right = Math.cos(ang) >= -0.01;
          ctx.globalAlpha = clamp(cp.z * 2.5, 0, 1);
          ctx.strokeStyle = 'rgba(' + C.ink + ',' + (isActive ? 0.6 : 0.28) + ')';
          ctx.lineWidth = 0.8 * dpr;
          ctx.beginPath(); ctx.moveTo(cp.x + Math.cos(ang) * 4 * dpr, cp.y + Math.sin(ang) * 4 * dpr); ctx.lineTo(ex, ey);
          ctx.lineTo(ex + (right ? 8 : -8) * dpr, ey); ctx.stroke();
          var lx = ex + (right ? 12 : -12) * dpr, ly = ey;
          ctx.textAlign = right ? 'left' : 'right';
          ctx.font = (isActive ? '500 ' + Math.round(19 * dpr) : '400 ' + Math.round(15 * dpr)) + 'px ' + FONT;
          ctx.fillStyle = isActive ? 'rgba(' + C.accent + ',1)' : 'rgba(' + C.ink + ',0.78)';
          ctx.fillText(city.native, lx, ly);
          ctx.globalAlpha = 1;
        }
      }
    }

    // Home
    if (hp.z > 0) {
      var hpulse = this.reduced ? 0.5 : (t * 0.6) % 1;
      ctx.strokeStyle = 'rgba(' + C.accent + ',' + (0.5 * (1 - hpulse)) + ')';
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath(); ctx.arc(hp.x, hp.y, (6 + hpulse * 22) * dpr, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(' + C.accent + ',1)';
      ctx.beginPath(); ctx.arc(hp.x, hp.y, 4 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.font = 'italic 500 ' + Math.round(17 * dpr) + 'px ' + FONT;
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(' + C.ink + ',0.95)';
      ctx.fillText(this.homeLabel, hp.x + 12 * dpr, hp.y + 14 * dpr);
    }
  };

  window.Globe = Globe;
})();
